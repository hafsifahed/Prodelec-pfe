// src/statistics/statistics.service.ts
import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Avis } from '../avis/entities/avis.entity';
import { Devis } from '../devis/entities/devi.entity';
import { Order } from '../order/entities/order.entity';
import { Partner } from '../partners/entities/partner.entity';
import { Project } from '../project/entities/project.entity';
import { Reclamation } from '../reclamation/entities/reclamation.entity';
import { UserSession } from '../user-session/entities/user-session.entity';
import { User } from '../users/entities/users.entity';

export interface GlobalStats {
  totalOrders: number;
  cancelledOrders: number;
  totalProjects: number;
  completedProjects: number;
  lateProjects: number;
  averageAvis: number;
  reclamationRatio: number;
  totalAvis: number;
  newOrders?: number;
  newProjects?: number;
  sessions?: {
    totalEmployees: number;
    connectedEmployees: number;
    totalClients: number;
    connectedClients: number;
  };
}

export interface PeriodStats {
  period: string;
  data: GlobalStats;
  comparison?: {
    previousPeriod: string;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
}

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Project) private projectRepo: Repository<Project>,
    @InjectRepository(Reclamation) private reclamRepo: Repository<Reclamation>,
    @InjectRepository(Avis) private avisRepo: Repository<Avis>,
    @InjectRepository(UserSession) private sessionRepo: Repository<UserSession>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Partner) private readonly partnerRepo: Repository<Partner>,
    @InjectRepository(Devis) private readonly devisRepo: Repository<Devis>,
  ) {}

  // Méthode pour obtenir les dates selon la période
  private getDateRange(period: string, specificYear?: number): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();
    
    switch (period) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        start.setDate(end.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'year':
        if (specificYear) {
          // Utiliser l'année spécifique
          start.setFullYear(specificYear, 0, 1);
          start.setHours(0, 0, 0, 0);
          end.setFullYear(specificYear, 11, 31);
          end.setHours(23, 59, 59, 999);
        } else {
          // Année courante par défaut
          start.setFullYear(end.getFullYear() - 1);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
        }
        break;
      default:
        start.setMonth(end.getMonth() - 1);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
    }
    
    return { start, end };
  }

  // Méthode principale avec support des périodes
  async getGlobalStats(period: string = 'month', userId?: number, specificYear?: number): Promise<GlobalStats> {
    const { start, end } = this.getDateRange(period, specificYear);
    const isClientRole = userId !== undefined;

    // Construire les conditions de filtre
    const baseWhere = { createdAt: Between(start, end) };
    const userWhere = { ...baseWhere, user: { id: userId } };

    /* ---------- Commandes ---------- */
    const [totalOrders, cancelledOrders] = await Promise.all([
      isClientRole 
        ? this.orderRepo.count({ where: userWhere })
        : this.orderRepo.count({ where: baseWhere }),
      
      isClientRole
        ? this.orderRepo.count({ where: { ...userWhere, annuler: true } })
        : this.orderRepo.count({ where: { ...baseWhere, annuler: true } }),
    ]);

    /* ---------- Projets ---------- */
    const projectsQuery = isClientRole
      ? this.projectRepo.createQueryBuilder('project')
          .leftJoin('project.order', 'order')
          .where('order.userId = :userId', { userId })
          .andWhere('project.createdAt BETWEEN :start AND :end', { start, end })
      : this.projectRepo.createQueryBuilder('project')
          .where('project.createdAt BETWEEN :start AND :end', { start, end });

    const projects = await projectsQuery.getMany();
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.progress === 100).length;
    const lateProjects = projects.filter(p => 
      !!p.dlp && p.progress !== 100 && new Date(p.dlp) < new Date()
    ).length;

    /* ---------- Avis ---------- */
    const avisQuery = isClientRole
      ? this.avisRepo.createQueryBuilder('avis')
          .leftJoin('avis.user', 'user')
          .where('user.id = :userId', { userId })
          .andWhere('avis.createdAt BETWEEN :start AND :end', { start, end })
      : this.avisRepo.createQueryBuilder('avis')
          .where('avis.createdAt BETWEEN :start AND :end', { start, end });

    const avisList = await avisQuery.getMany();
    const totalAvis = avisList.length;
    const averageAvis = totalAvis
      ? +(avisList.reduce((s, a) => s + (a.avg ?? 0), 0) / totalAvis).toFixed(2)
      : 0;

    /* ---------- Réclamations / ratio ---------- */
    const totalReclam = isClientRole
      ? await this.reclamRepo.createQueryBuilder('reclam')
          .leftJoin('reclam.user', 'user')
          .where('user.id = :userId', { userId })
          .andWhere('reclam.dateDeCreation BETWEEN :start AND :end', { start, end })
          .getCount()
      : await this.reclamRepo.count({ 
          where: { dateDeCreation: Between(start, end) } 
        });

    const reclamationRatio = totalProjects
      ? +(totalReclam / totalProjects * 100).toFixed(2)
      : 0;

    /* ---------- Sessions (uniquement pour admin) ---------- */
    let sessions = undefined;
    if (!isClientRole) {
      const clientPattern = '%client%';
      const [totalEmployees, totalClients, connectedEmployees, connectedClients] = await Promise.all([
        this.userRepo.createQueryBuilder('u')
          .innerJoin('u.role', 'r')
          .where('LOWER(r.name) NOT LIKE :clientPattern', { clientPattern })
          .getCount(),
        this.userRepo.createQueryBuilder('u')
          .innerJoin('u.role', 'r')
          .where('LOWER(r.name) LIKE :clientPattern', { clientPattern })
          .getCount(),
        this.sessionRepo.createQueryBuilder('s')
          .innerJoin('s.user', 'u')
          .innerJoin('u.role', 'r')
          .where('LOWER(r.name) NOT LIKE :clientPattern', { clientPattern })
          .andWhere('s.sessionEnd IS NULL')
          .getCount(),
        this.sessionRepo.createQueryBuilder('s')
          .innerJoin('s.user', 'u')
          .innerJoin('u.role', 'r')
          .where('LOWER(r.name) LIKE :clientPattern', { clientPattern })
          .andWhere('s.sessionEnd IS NULL')
          .getCount(),
      ]);

      sessions = {
        totalEmployees,
        connectedEmployees,
        totalClients,
        connectedClients,
      };
    }

    // Nouvelles commandes et projets pour la période
    const newOrders = totalOrders;
    const newProjects = totalProjects;

    /* ---------- Retour ---------- */
    return {
      totalOrders,
      cancelledOrders,
      totalProjects,
      completedProjects,
      lateProjects,
      averageAvis,
      reclamationRatio,
      totalAvis,
      newOrders,
      newProjects,
      sessions,
    };
  }

  // Méthode pour obtenir les statistiques comparatives
  async getComparativeStats(period: string = 'month', userId?: number, specificYear?: number): Promise<PeriodStats> {
    const currentStats = await this.getGlobalStats(period, userId, specificYear);
    
    // Obtenir les stats de la période précédente pour comparaison
    let previousPeriod = 'month';
    let previousYear = specificYear ? specificYear - 1 : undefined;
    
    switch (period) {
      case 'today':
        previousPeriod = 'yesterday';
        break;
      case 'week':
        previousPeriod = 'last-week';
        break;
      case 'month':
        previousPeriod = 'last-month';
        break;
      case 'year':
        previousPeriod = 'last-year';
        previousYear = specificYear ? specificYear - 1 : new Date().getFullYear() - 1;
        break;
    }

    const previousStats = await this.getGlobalStats(previousPeriod, userId, previousYear);
    
    // Calculer le changement pour les commandes
    const change = previousStats.totalOrders > 0 
      ? +(((currentStats.totalOrders - previousStats.totalOrders) / previousStats.totalOrders) * 100).toFixed(1)
      : currentStats.totalOrders > 0 ? 100 : 0;

    const trend: 'up' | 'down' | 'stable' = 
      change > 5 ? 'up' : change < -5 ? 'down' : 'stable';

    return {
      period,
      data: currentStats,
      comparison: {
        previousPeriod,
        change: Math.abs(change),
        trend,
      },
    };
  }

  // Les autres méthodes existantes
  async searchAll(keyword: string) {
    console.log('Recherche avec keyword:', keyword);

    if (!keyword) {
      return { projects: [], devis: [], partners: [] };
    }

    const partners = await this.partnerRepo.createQueryBuilder('partner')
      .where('LOWER(partner.name) LIKE LOWER(:keyword)', { keyword: `%${keyword}%` })
      .orWhere('LOWER(partner.address) LIKE LOWER(:keyword)', { keyword: `%${keyword}%` })
      .take(10)
      .getMany();

    const projects = await this.projectRepo.createQueryBuilder('project')
      .where('LOWER(project.refClient) LIKE LOWER(:keyword)', { keyword: `%${keyword}%` })
      .orWhere('LOWER(project.methodeComment) LIKE LOWER(:keyword)', { keyword: `%${keyword}%` })
      .take(10)
      .getMany();

    const devis = await this.devisRepo.createQueryBuilder('devis')
      .where('LOWER(devis.numdevis) LIKE LOWER(:keyword)', { keyword: `%${keyword}%` })
      .orWhere('LOWER(devis.projet) LIKE LOWER(:keyword)', { keyword: `%${keyword}%` })
      .take(10)
      .getMany();

    return { projects, devis, partners };
  }

  async searchAllUser(keyword: string, userId: number) {
    if (!keyword || !keyword.trim()) {
      return { projects: [], devis: [], partners: [] };
    }
    keyword = keyword.trim().toLowerCase();

    if (!userId) {
      throw new ForbiddenException('User ID is required');
    }

    // Recherche projets liés à l'utilisateur
    const projects = await this.projectRepo.createQueryBuilder('project')
      .leftJoin('project.order', 'order')
      .where('order.userId = :userId', { userId })
      .andWhere('(LOWER(project.refClient) LIKE :keyword OR LOWER(project.methodeComment) LIKE :keyword)', { keyword: `%${keyword}%` })
      .take(10)
      .getMany();

    // Recherche devis liés à l'utilisateur
    const devis = await this.devisRepo.createQueryBuilder('devis')
      .leftJoin('devis.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('(LOWER(devis.numdevis) LIKE :keyword OR LOWER(devis.projet) LIKE :keyword)', { keyword: `%${keyword}%` })
      .take(10)
      .getMany();

    // Recherche partenaires (optionnel, ici vide car pas lié à user)
    const partners = [];

    return { projects, devis, partners };
  }

   async getAvailableYears(): Promise<number[]> {
    try {
      // Récupérer les années distinctes de toutes les tables principales
      const [orderYears, projectYears, avisYears, reclamationYears] = await Promise.all([
        this.orderRepo
          .createQueryBuilder('order')
          .select('DISTINCT YEAR(order.createdAt)', 'year')
          .orderBy('year', 'DESC')
          .getRawMany(),
        
        this.projectRepo
          .createQueryBuilder('project')
          .select('DISTINCT YEAR(project.createdAt)', 'year')
          .orderBy('year', 'DESC')
          .getRawMany(),
        
        this.avisRepo
          .createQueryBuilder('avis')
          .select('DISTINCT YEAR(avis.createdAt)', 'year')
          .orderBy('year', 'DESC')
          .getRawMany(),
        
        this.reclamRepo
          .createQueryBuilder('reclamation')
          .select('DISTINCT YEAR(reclamation.dateDeCreation)', 'year')
          .orderBy('year', 'DESC')
          .getRawMany()
      ]);

      // Fusionner toutes les années et supprimer les doublons
      const allYears = [
        ...orderYears.map(item => parseInt(item.year)),
        ...projectYears.map(item => parseInt(item.year)),
        ...avisYears.map(item => parseInt(item.year)),
        ...reclamationYears.map(item => parseInt(item.year))
      ];

      // Retourner les années uniques triées par ordre décroissant
      return [...new Set(allYears)]
        .filter(year => !isNaN(year) && year > 2000) // Filtre pour valider les années
        .sort((a, b) => b - a);
        
    } catch (error) {
      this.logger.error('Error fetching available years', error);
      return [];
    }
  }
}