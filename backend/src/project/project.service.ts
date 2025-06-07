import {
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NotificationsService } from '../notifications/notifications.service';
import { Order } from '../order/entities/order.entity';
import { User } from '../users/entities/users.entity';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)  private projectRepo: Repository<Project>,
    @InjectRepository(Order)    private orderRepo  : Repository<Order>,
    @InjectRepository(User)     private userRepo   : Repository<User>,
    private readonly notifSrv: NotificationsService,
  ) {}

  /* ------------------------------------------------------------------------
   * CRÉATION
   * --------------------------------------------------------------------- */
  async addProject(
    project: Project,
    idOrder: number,
    conceptionResp?: string,
    methodeResp?: string,
    productionResp?: string,
    finalControlResp?: string,
    deliveryResp?: string,
  ): Promise<Project> {

    const order = await this.orderRepo.findOne({ where: {idOrder} });
    if (!order) throw new NotFoundException('Order not found');

    const cr  = await this.workerByUsername(conceptionResp);
    const mr  = await this.workerByUsername(methodeResp);
    const pr  = await this.workerByUsername(productionResp);
    const fcr = await this.workerByUsername(finalControlResp);
    const dr  = await this.workerByUsername(deliveryResp);

    project.order                   = order;
    project.conceptionResponsible   = cr;
    project.methodeResponsible      = mr;
    project.productionResponsible   = pr;
    project.finalControlResponsible = fcr;
    project.deliveryResponsible     = dr;

    const saved = await this.projectRepo.save(project);
    return saved;
  }

  /* ------------------------------------------------------------------------
   * MISE-À-JOUR
   * --------------------------------------------------------------------- */
  async updateProject(
    projectId: number,
    dto: Partial<Project>,
    conceptionResp?: string,
    methodeResp?: string,
    productionResp?: string,
    finalControlResp?: string,
    deliveryResp?: string,
  ): Promise<Project> {
    const proj = await this.projectRepo.findOne({ where: { idproject: projectId } });
    if (!proj) throw new NotFoundException('Project not found');

    Object.assign(proj, dto);

    // responsables
    proj.conceptionResponsible   = await this.workerByUsername(conceptionResp);
    proj.methodeResponsible      = await this.workerByUsername(methodeResp);
    proj.productionResponsible   = await this.workerByUsername(productionResp);
    proj.finalControlResponsible = await this.workerByUsername(finalControlResp);
    proj.deliveryResponsible     = await this.workerByUsername(deliveryResp);

    const saved = await this.projectRepo.save(proj);
    return saved;
  }

  /* ------------------------------------------------------------------------
   * REQUÊTES DE BASE (using QueryBuilder for clarity and consistency)
   * --------------------------------------------------------------------- */
  private baseQuery() {
    return this.projectRepo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.order', 'order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('project.conceptionResponsible', 'conceptionResponsible')
      .leftJoinAndSelect('project.methodeResponsible', 'methodeResponsible')
      .leftJoinAndSelect('project.productionResponsible', 'productionResponsible')
      .leftJoinAndSelect('project.finalControlResponsible', 'finalControlResponsible')
      .leftJoinAndSelect('project.deliveryResponsible', 'deliveryResponsible');
  }

  findAll() {
    return this.baseQuery().getMany();
  }

  async findOne(id: number) {
    const proj = await this.baseQuery()
      .where('project.idproject = :id', { id })
      .getOne();
    if (!proj) throw new NotFoundException('Project not found');
    return proj;
  }

  async remove(id: number) {
    await this.projectRepo.delete(id);
  }

  /* ------------------------------------------------------------------------
   * PROJETS PAR USER (fixed with QueryBuilder)
   * --------------------------------------------------------------------- */
  async getByUser(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.projectRepo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.order', 'order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('project.conceptionResponsible', 'conceptionResponsible')
      .leftJoinAndSelect('project.methodeResponsible', 'methodeResponsible')
      .leftJoinAndSelect('project.productionResponsible', 'productionResponsible')
      .leftJoinAndSelect('project.finalControlResponsible', 'finalControlResponsible')
      .leftJoinAndSelect('project.deliveryResponsible', 'deliveryResponsible')
      .where('user.id = :userId', { userId })
      .getMany();
  }

  /* ------------------------------------------------------------------------
   * CHANGEMENT DE STATUTS / PROGRESSION
   * Chaque méthode renvoie le projet mis à jour.
   * --------------------------------------------------------------------- */
  async toggleBool(id: number, field: keyof Project, value: boolean) {
    const proj = await this.findOne(id);
    (proj as any)[field] = value;
    return this.projectRepo.save(proj);
  }

  changeStatusConception(id: number, v: boolean) {
    return this.toggleBool(id, 'conceptionStatus', v);
  }
  changeStatusMethode(id: number, v: boolean) {
    return this.toggleBool(id, 'methodeStatus', v);
  }
  changeStatusProduction(id: number, v: boolean) {
    return this.toggleBool(id, 'productionStatus', v);
  }
  changeStatusFC(id: number, v: boolean) {
    return this.toggleBool(id, 'finalControlStatus', v);
  }
  changeStatusDelivery(id: number, v: boolean) {
    return this.toggleBool(id, 'deliveryStatus', v);
  }

  async setProgress(id: number, field: keyof Project, value: number) {
    const proj = await this.findOne(id);
    (proj as any)[field] = value;
    return this.projectRepo.save(proj);
  }

  setConceptionProgress(id: number, p: number) {
    return this.setProgress(id, 'conceptionprogress', p);
  }
  setMethodeProgress(id: number, p: number) {
    return this.setProgress(id, 'methodeprogress', p);
  }
  setProductionProgress(id: number, p: number) {
    return this.setProgress(id, 'productionprogress', p);
  }
  setFcProgress(id: number, p: number) {
    return this.setProgress(id, 'fcprogress', p);
  }
  setDeliveryProgress(id: number, p: number) {
    return this.setProgress(id, 'deliveryprogress', p);
  }

  /* --------------------------------------------------------------------- */
  async computeGlobalProgress(id: number) {
    const p = await this.findOne(id);

    const done =
      (p.conceptionStatus ? p.conceptionDuration : 0) +
      (p.methodeStatus ? p.methodeDuration : 0) +
      (p.productionStatus ? p.productionDuration : 0) +
      (p.finalControlStatus ? p.finalControlDuration : 0) +
      (p.deliveryStatus ? p.deliveryDuration : 0);

    p.progress = +(done / p.duree) * 100;
    return this.projectRepo.save(p);
  }

  /* --------------------------------------------------------------------- */
  async toggleArchive(id: number, field: 'archivera' | 'archiverc') {
    const p = await this.findOne(id);
    (p as any)[field] = !(p as any)[field];
    return this.projectRepo.save(p);
  }

  /* ------------------------------------------------------------------------
   * OUTILS PRIVÉS
   * --------------------------------------------------------------------- */
  private async workerByUsername(username?: string): Promise<User | null> {
    if (!username) return null;
    return this.userRepo.findOne({ where: { username: username } });
  }

  async getByPartner(partnerId: number) {
  return this.projectRepo
    .createQueryBuilder('project')
    .leftJoinAndSelect('project.order', 'order')
    .leftJoinAndSelect('order.user', 'user')
    .leftJoinAndSelect('user.partner', 'partner')
    .leftJoinAndSelect('project.conceptionResponsible', 'conceptionResponsible')
    .leftJoinAndSelect('project.methodeResponsible', 'methodeResponsible')
    .leftJoinAndSelect('project.productionResponsible', 'productionResponsible')
    .leftJoinAndSelect('project.finalControlResponsible', 'finalControlResponsible')
    .leftJoinAndSelect('project.deliveryResponsible', 'deliveryResponsible')
    .where('partner.id = :partnerId', { partnerId })
    .getMany();
}
}
