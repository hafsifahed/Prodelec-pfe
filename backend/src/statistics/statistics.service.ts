// src/statistics/statistics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  reclamationRatio: number;          // % réclamations / projets

  sessions: {
    totalEmployees: number;
    connectedEmployees: number;
    totalClients: number;
    connectedClients: number;
  };
}

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Order)        private orderRepo: Repository<Order>,
    @InjectRepository(Project)      private projectRepo: Repository<Project>,
    @InjectRepository(Reclamation)  private reclamRepo: Repository<Reclamation>,
    @InjectRepository(Avis)         private avisRepo: Repository<Avis>,
    @InjectRepository(UserSession)  private sessionRepo: Repository<UserSession>,
    @InjectRepository(User)         private userRepo: Repository<User>,
    @InjectRepository(Partner)      private readonly partnerRepo: Repository<Partner>,
    @InjectRepository(Devis)        private readonly devisRepo: Repository<Devis>,
  ) {}

  /** Statistiques agrégées pour le tableau de bord */
  async getGlobalStats(): Promise<GlobalStats> {

    /* ---------- Commandes ---------- */
    const [totalOrders, cancelledOrders] = await Promise.all([
      this.orderRepo.count(),
      this.orderRepo.count({ where: { annuler: true } }),
    ]);

    /* ---------- Projets ---------- */
    const projects       = await this.projectRepo.find();
    const totalProjects  = projects.length;
    const completedProjects = projects.filter(p => p.progress === 100).length;
    const lateProjects      = projects.filter(p =>
      !!p.dlp && p.progress !== 100 && new Date(p.dlp) < new Date()
    ).length;

    /* ---------- Avis ---------- */
    const avisList   = await this.avisRepo.find();
    const averageAvis = avisList.length
      ? avisList.reduce((s, a) => s + (a.avg ?? 0), 0) / avisList.length
      : 0;

    /* ---------- Réclamations / ratio ---------- */
    const totalReclam = await this.reclamRepo.count();
    const reclamationRatio = totalProjects
      ? +(totalReclam / totalProjects * 100).toFixed(2)
      : 0;

    /* ---------- Sessions ---------- */
    // employés = rôle qui ne commence pas par "CLIENT"
    const clientPattern = '%client%';
    const [ totalEmployees, totalClients ] = await Promise.all([
      this.userRepo.createQueryBuilder('u')
        .innerJoin('u.role', 'r')
        .where('LOWER(r.name) NOT LIKE :clientPattern', { clientPattern })
        .getCount(),
      this.userRepo.createQueryBuilder('u')
        .innerJoin('u.role', 'r')
        .where('LOWER(r.name) LIKE :clientPattern', { clientPattern })
        .getCount(),
    ]);

    const [ connectedEmployees, connectedClients ] = await Promise.all([
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

    /* ---------- Retour ---------- */
    return {
      totalOrders,
      cancelledOrders,

      totalProjects,
      completedProjects,
      lateProjects,

      averageAvis: +averageAvis.toFixed(2),
      reclamationRatio,

      sessions: {
        totalEmployees,
        connectedEmployees,
        totalClients,
        connectedClients,
      },
    };
  }

  /*-----------------search------------*/
  async searchAll(keyword: string) {
      console.log('Recherche avec keyword:', keyword); // Ajouté pour debug

  if (!keyword) {
    console.log("errrr")
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

  console.log(projects);
  console.log(partners);
  console.log(devis);

  return { projects, devis, partners };
}

}
