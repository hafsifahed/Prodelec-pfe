// src/statistics/charts-statistics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Avis } from '../avis/entities/avis.entity';
import { CahierDesCharges, EtatCahier } from '../cahier-des-charges/entities/cahier-des-charge.entity';
import { Devis, EtatDevis } from '../devis/entities/devi.entity';
import { Partner } from '../partners/entities/partner.entity';
import { Project } from '../project/entities/project.entity';
import { Reclamation } from '../reclamation/entities/reclamation.entity';
import { User } from '../users/entities/users.entity';
import { ChartsFilterDto } from './dto/charts-filter.dto';
import { ChartData, ChartsStatistics, PartnerFilter, UserFilter } from './dto/charts-stats.interface';

@Injectable()
export class ChartsStatisticsService {
  constructor(
    @InjectRepository(Reclamation)
    private readonly reclamationRepo: Repository<Reclamation>,
    @InjectRepository(CahierDesCharges)
    private readonly cdcRepo: Repository<CahierDesCharges>,
    @InjectRepository(Devis)
    private readonly devisRepo: Repository<Devis>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Avis)
    private readonly avisRepo: Repository<Avis>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Partner)
    private readonly partnerRepo: Repository<Partner>,
  ) {}

  async getChartsStatistics(filters: ChartsFilterDto): Promise<ChartsStatistics> {
    const [reclamations, cahiersDesCharges, devis, projects, avis] = await Promise.all([
      this.getReclamationsData(filters),
      this.getCahiersDesChargesData(filters),
      this.getDevisData(filters),
      this.getProjectsData(filters),
      this.getAvisData(filters),
    ]);

    return {
      reclamations,
      cahiersDesCharges,
      devis,
      projects,
      avis,
    };
  }

  async getFilterOptions(partnerId?: number): Promise<{ users: UserFilter[]; partners: PartnerFilter[]; years: number[] }> {
  const [users, partners, years] = await Promise.all([
    this.getUsersForFilters(partnerId),
    this.getPartnersForFilters(),
    this.getAvailableYears(),
  ]);

  return { users, partners, years };
}

  private async getReclamationsData(filters: ChartsFilterDto): Promise<ChartData> {
    const query = this.buildBaseQuery(this.reclamationRepo, 'user', filters);
    
    const reclamations = await query.getMany();
    
    const treated = reclamations.filter(r => r.status === 'Traité').length;
    const ongoing = reclamations.filter(r => r.status === 'En cours').length;

    return {
      series: [treated, ongoing],
      labels: ['Traité', 'En cours'],
      colors: ['#00E396', '#FFCC00'],
      total: reclamations.length,
    };
  }

  private async getCahiersDesChargesData(filters: ChartsFilterDto): Promise<ChartData> {
    const query = this.buildBaseQuery(this.cdcRepo, 'user', filters);
    
    const cahiers = await query.getMany();
    
    const accepted = cahiers.filter(c => c.etat === EtatCahier.Accepte).length;
    const refused = cahiers.filter(c => c.etat === EtatCahier.Refuse).length;
    const pending = cahiers.filter(c => c.etat === EtatCahier.EnAttente).length;

    return {
      series: [accepted, refused, pending],
      labels: ['Accepté', 'Refusé', 'En attente'],
      colors: ['#00E396', '#FF4560', '#0096FF'],
      total: cahiers.length,
    };
  }

  private async getDevisData(filters: ChartsFilterDto): Promise<ChartData> {
    const query = this.buildBaseQuery(this.devisRepo, 'user', filters);
    
    const devis = await query.getMany();
    
    const accepted = devis.filter(d => d.etat === EtatDevis.Accepte).length;
    const refused = devis.filter(d => d.etat === EtatDevis.Refuse).length;
    const pending = devis.filter(d => d.etat === EtatDevis.EnAttente).length;

    return {
      series: [accepted, refused, pending],
      labels: ['Accepté', 'Refusé', 'En attente'],
      colors: ['#00E396', '#FF4560', '#0096FF'],
      total: devis.length,
    };
  }

  private async getProjectsData(filters: ChartsFilterDto): Promise<ChartData> {
    const query = this.projectRepo.createQueryBuilder('project')
      .leftJoinAndSelect('project.order', 'order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('user.partner', 'partner');

    this.applyFilters(query, filters, 'project');

    const projects = await query.getMany();
    
    const delivered = projects.filter(p => p.progress === 100).length;
    const late = projects.filter(p => 
      p.dlp && p.progress !== 100 && new Date(p.dlp) < new Date()
    ).length;

    return {
      series: [delivered, late],
      labels: ['Livré', 'Retard'],
      colors: ['#00E396', '#FF4560'],
      total: projects.length,
    };
  }

  private async getAvisData(filters: ChartsFilterDto): Promise<any> {
    const query = this.avisRepo.createQueryBuilder('avis')
      .leftJoinAndSelect('avis.user', 'user')
      .leftJoinAndSelect('user.partner', 'partner');

    this.applyFilters(query, filters, 'avis');

    const avisList = await query.getMany();
    
    const nbPositifs = avisList.filter(a => (a.avg ?? 0) >= 70).length;
    const nbMoyens = avisList.filter(a => (a.avg ?? 0) >= 50 && (a.avg ?? 0) < 70).length;
    const nbNegatifs = avisList.filter(a => (a.avg ?? 0) < 50).length;

    const average = avisList.length 
      ? +(avisList.reduce((sum, a) => sum + (a.avg ?? 0), 0) / avisList.length).toFixed(2)
      : 0;

    const details = avisList.map(a => ({
      username: a.user?.username || '-',
      partnerName: a.user?.partner?.name || '-',
      score: a.avg ?? 0,
    }));

    return {
      series: [nbPositifs, nbMoyens, nbNegatifs],
      labels: ['Satisfaits (≥70%)', 'Moyens (50-69%)', 'Insatisfaits (<50%)'],
      colors: ['#00E396', '#FFCC00', '#FF4560'],
      total: avisList.length,
      average,
      totalAvis: avisList.length,
      details,
    };
  }

  private buildBaseQuery<T>(
    repo: Repository<T>,
    userRelation: string,
    filters: ChartsFilterDto,
  ) {
    const query = repo.createQueryBuilder('entity')
      .leftJoinAndSelect(`entity.${userRelation}`, 'user')
      .leftJoinAndSelect('user.partner', 'partner');

    this.applyFilters(query, filters, 'entity');
    
    return query;
  }

  private applyFilters(query: any, filters: ChartsFilterDto, entityAlias: string) {
    const { userId, partnerId, year } = filters;

    if (userId) {
      query.andWhere('user.id = :userId', { userId });
    } else if (partnerId) {
      query.andWhere('partner.id = :partnerId', { partnerId });
    }

    if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      
      const dateField = this.getDateField(entityAlias);
      query.andWhere(`${entityAlias}.${dateField} BETWEEN :startDate AND :endDate`, {
        startDate,
        endDate,
      });
    }
  }

  private getDateField(entityAlias: string): string {
    const dateFields = {
      reclamation: 'dateDeCreation',
      cahierDesCharges: 'createdAt',
      devis: 'dateCreation',
      project: 'createdAt',
      avis: 'createdAt',
      entity: 'createdAt', // fallback
    };

    return dateFields[entityAlias] || 'createdAt';
  }

  private async getUsersForFilters(partnerId?: number): Promise<UserFilter[]> {
  const query = this.userRepo.createQueryBuilder('user')
    .leftJoinAndSelect('user.partner', 'partner')
    .leftJoinAndSelect('user.role', 'role') // Jointure avec la table des rôles
    .select(['user.id', 'user.email', 'user.username', 'partner.id', 'partner.name'])
    .where('role.name LIKE :rolePattern', { rolePattern: 'client%' }); // Filtre sur le nom du rôle

  if (partnerId) {
    query.andWhere('partner.id = :partnerId', { partnerId });
  }

  const users = await query.getMany();

  return users.map(user => ({
    id: user.id,
    email: user.email,
    username: user.username,
    partner: user.partner ? { id: user.partner.id, name: user.partner.name } : undefined,
  }));
}

  private async getPartnersForFilters(): Promise<PartnerFilter[]> {
    const partners = await this.partnerRepo.find({
      select: ['id', 'name'],
    });

    return partners.map(partner => ({
      id: partner.id,
      name: partner.name,
    }));
  }

  private async getAvailableYears(): Promise<number[]> {
    const years = await Promise.all([
      this.reclamationRepo.createQueryBuilder('r')
        .select('YEAR(r.dateDeCreation)', 'year')
        .distinct(true)
        .getRawMany(),
      this.cdcRepo.createQueryBuilder('c')
        .select('YEAR(c.createdAt)', 'year')
        .distinct(true)
        .getRawMany(),
      this.devisRepo.createQueryBuilder('d')
        .select('YEAR(d.dateCreation)', 'year')
        .distinct(true)
        .getRawMany(),
    ]);

    const allYears = years.flat().map(item => item.year).filter(year => year);
    return [...new Set(allYears)].sort((a, b) => b - a);
  }
}