import {
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NotificationsService } from '../notifications/notifications.service';
import { Order } from '../order/entities/order.entity';
import { Role } from '../roles/enums/roles.enum';
import { User } from '../users/entities/users.entity';
import { WorkflowPhase } from '../workflow-discussion/entities/workflow-discussion.entity';
import { WorkflowDiscussionService } from '../workflow-discussion/workflow-discussion.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project) private projectRepo: Repository<Project>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private readonly notifSrv: NotificationsService,
    private readonly workflowDiscussionService: WorkflowDiscussionService,
  ) {}

  /* ------------------------------------------------------------------------
   * CRÉATION
   * --------------------------------------------------------------------- */
  async addProject(
    dto: CreateProjectDto,
    idOrder: number,
    conceptionResp?: string,
    methodeResp?: string,
    productionResp?: string,
    finalControlResp?: string,
    deliveryResp?: string,
  ): Promise<Project> {
    const order = await this.orderRepo.findOne({ where: { idOrder } });
    if (!order) throw new NotFoundException('Order not found');

    const project = this.projectRepo.create(dto);

    project.order = order;
    project.conceptionResponsible   = conceptionResp   ? await this.workerByUsername(conceptionResp)   : null;
    project.methodeResponsible      = methodeResp      ? await this.workerByUsername(methodeResp)      : null;
    project.productionResponsible   = productionResp   ? await this.workerByUsername(productionResp)   : null;
    project.finalControlResponsible = finalControlResp ? await this.workerByUsername(finalControlResp) : null;
    project.deliveryResponsible     = deliveryResp     ? await this.workerByUsername(deliveryResp)     : null;

    // Flags d’existence des phases
    project.conceptionExist   = dto.conceptionExist   ?? false;
    project.methodeExist      = dto.methodeExist      ?? false;
    project.productionExist   = dto.productionExist   ?? false;
    project.finalControlExist = dto.finalControlExist ?? false;
    project.deliveryExist     = dto.deliveryExist     ?? false;

    const saved = await this.projectRepo.save(project);

    // 🔔 Notifier les responsables déjà affectés
    await this.notifyResponsibles(
      saved,
      'Nouveau projet créé',
      `Le projet #${saved.idproject} vous est assigné.`,
    );

    // 🔔 Notifier les responsables globaux si une phase existe mais non affectée
    await this.notifyGlobalResponsables(saved);

    // Lier à la discussion existante
    if (order.devis) {
      const discussion = await this.workflowDiscussionService.getDiscussionByDevis(order.devis.id);
      await this.workflowDiscussionService.transitionPhase(
        discussion.cdc.id,
        {
          targetPhase: WorkflowPhase.PROJECT,
          targetEntityId: saved.idproject,
        },
      );
    }
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
    const proj = await this.projectRepo.findOne({
      where: { idproject: projectId },
      relations: [
        'conceptionResponsible',
        'methodeResponsible',
        'productionResponsible',
        'finalControlResponsible',
        'deliveryResponsible',
      ],
    });
    if (!proj) throw new NotFoundException('Project not found');

    // Sauvegarder les responsables actuels
    const oldResponsables = [
      proj.conceptionResponsible?.id,
      proj.methodeResponsible?.id,
      proj.productionResponsible?.id,
      proj.finalControlResponsible?.id,
      proj.deliveryResponsible?.id,
    ].filter(id => id != null);

    // Mise à jour des champs
    Object.assign(proj, dto);

    // Mise à jour des responsables directs
    proj.conceptionResponsible   = await this.workerByUsername(conceptionResp);
    proj.methodeResponsible      = await this.workerByUsername(methodeResp);
    proj.productionResponsible   = await this.workerByUsername(productionResp);
    proj.finalControlResponsible = await this.workerByUsername(finalControlResp);
    proj.deliveryResponsible     = await this.workerByUsername(deliveryResp);

    const saved = await this.projectRepo.save(proj);

    // Nouveaux responsables après update
    const newResponsables = [
      saved.conceptionResponsible?.id,
      saved.methodeResponsible?.id,
      saved.productionResponsible?.id,
      saved.finalControlResponsible?.id,
      saved.deliveryResponsible?.id,
    ].filter(id => id != null);

    // Trouver les responsables ajoutés
    const addedResponsablesIds = newResponsables.filter(id => !oldResponsables.includes(id));
    const addedResponsables = [];
    for (const id of addedResponsablesIds) {
      const user = await this.userRepo.findOne({ where: { id } });
      if (user) addedResponsables.push(user);
    }

    // 🔔 Notif aux nouveaux responsables ajoutés
    for (const user of addedResponsables) {
      await this.notifSrv.createAndSendNotification(
        user,
        'Nouveau projet assigné',
        `Vous avez été ajouté comme responsable du projet #${saved.idproject}`,
        { projectId: saved.idproject },
      );
    }

    // 🔔 Notif aux responsables globaux si phase existe mais non affectée
    await this.notifyGlobalResponsables(saved);

    return saved;
  }

  /* ------------------------------------------------------------------------
   * NOTIFICATIONS
   * --------------------------------------------------------------------- */
  private async notifyResponsibles(project: Project, title: string, message: string): Promise<void> {
    const responsables = [
      project.conceptionResponsible,
      project.methodeResponsible,
      project.productionResponsible,
      project.finalControlResponsible,
      project.deliveryResponsible,
    ].filter(user => user != null);

    for (const user of responsables) {
      await this.notifSrv.createAndSendNotification(user, title, message, { projectId: project.idproject });
    }
  }

  private async notifyGlobalResponsables(project: Project): Promise<void> {
    const phaseMapping: {
      existField: keyof Project;
      respField: keyof Project;
      role: Role;
      label: string;
    }[] = [
      { existField: 'conceptionExist',   respField: 'conceptionResponsible',   role: Role.RESPONSABLE_CONCEPTION,   label: 'Conception' },
      { existField: 'methodeExist',      respField: 'methodeResponsible',      role: Role.RESPONSABLE_METHODE,      label: 'Méthode' },
      { existField: 'productionExist',   respField: 'productionResponsible',   role: Role.RESPONSABLE_PRODUCTION,   label: 'Production' },
      { existField: 'finalControlExist', respField: 'finalControlResponsible', role: Role.RESPONSABLE_QUALITE,      label: 'Contrôle Final' },
      { existField: 'deliveryExist',     respField: 'deliveryResponsible',     role: Role.RESPONSABLE_LOGISTIQUE,   label: 'Livraison' },
    ];

    for (const phase of phaseMapping) {
      const exists = project[phase.existField] as boolean;
      const assigned = project[phase.respField] as User | null;

      if (exists && !assigned) {
        const responsables = await this.getResponsablesByRole(phase.role);
        for (const resp of responsables) {
          await this.notifSrv.createAndSendNotification(
            resp,
            `Affectation requise - ${phase.label}`,
            `Le projet #${project.idproject} nécessite une affectation en ${phase.label}.`,
            { projectId: project.idproject },
          );
        }
      }
    }
  }

  private async getResponsablesByRole(roleName: Role): Promise<User[]> {
    return this.userRepo.find({
      where: { role: { name: roleName } },
      relations: ['role'],
    });
  }

  /* ------------------------------------------------------------------------
   * OUTILS
   * --------------------------------------------------------------------- */
  private async workerByUsername(username?: string): Promise<User | null> {
    if (!username) return null;
    return this.userRepo.findOne({ where: { username }, relations: ['role'] });
  }
  /* ------------------------------------------------------------------------
   * REQUÊTES DE BASE (using QueryBuilder for clarity and consistency)
   * --------------------------------------------------------------------- */
  private baseQuery() {
  return this.projectRepo
    .createQueryBuilder('project')
    .leftJoinAndSelect('project.order', 'order')
    .leftJoinAndSelect('order.user', 'user')
    .leftJoinAndSelect('user.partner', 'partner') // ajout relation partner
    .leftJoinAndSelect('project.conceptionResponsible', 'conceptionResponsible')
    .leftJoinAndSelect('project.methodeResponsible', 'methodeResponsible')
    .leftJoinAndSelect('project.productionResponsible', 'productionResponsible')
    .leftJoinAndSelect('project.finalControlResponsible', 'finalControlResponsible')
    .leftJoinAndSelect('project.deliveryResponsible', 'deliveryResponsible')
    .orderBy('project.updatedAt', 'DESC') // plus récemment modifié en haut
    .addOrderBy('project.createdAt', 'DESC'); // sinon plus récemment créé
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
      .leftJoinAndSelect('user.partner', 'partner') 
      .leftJoinAndSelect('user.role', 'role')
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

  // Sauvegarde partielle
  await this.projectRepo.save(proj);

  // Mise à jour des status selon les progress partiels
  await this.updateStatusesFromProgress(id);

  // Recalcul du progrès global
  return this.computeGlobalProgress(id);
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

  async updateStatusesFromProgress(id: number) {
  const p = await this.findOne(id);

  p.conceptionStatus = (p.conceptionprogress >= 100);
  p.methodeStatus = (p.methodeprogress >= 100);
  p.productionStatus = (p.productionprogress >= 100);
  p.finalControlStatus = (p.fcprogress >= 100);
  p.deliveryStatus = (p.deliveryprogress >= 100);

  return this.projectRepo.save(p);
}


  /* --------------------------------------------------------------------- */
async computeGlobalProgress(id: number) {
  const p = await this.findOne(id);

  const doneRaw =
    (p.conceptionDuration * (p.conceptionStatus ? 100 : p.conceptionprogress)) +
    (p.methodeDuration * (p.methodeStatus ? 100 : p.methodeprogress)) +
    (p.productionDuration * (p.productionStatus ? 100 : p.productionprogress)) +
    (p.finalControlDuration * (p.finalControlStatus ? 100 : p.fcprogress)) +
    (p.deliveryDuration * (p.deliveryStatus ? 100 : p.deliveryprogress));

  const done = doneRaw / 100;

  p.progress = (done / p.duree) * 100;

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

  async getByPartner(partnerId: number) {
  return this.projectRepo
    .createQueryBuilder('project')
    .leftJoinAndSelect('project.order', 'order')
    .leftJoinAndSelect('order.user', 'user')
    .leftJoinAndSelect('user.partner', 'partner')
    .leftJoinAndSelect('user.role', 'role') // ajout relation partner
    .leftJoinAndSelect('project.conceptionResponsible', 'conceptionResponsible')
    .leftJoinAndSelect('project.methodeResponsible', 'methodeResponsible')
    .leftJoinAndSelect('project.productionResponsible', 'productionResponsible')
    .leftJoinAndSelect('project.finalControlResponsible', 'finalControlResponsible')
    .leftJoinAndSelect('project.deliveryResponsible', 'deliveryResponsible')
    .where('partner.id = :partnerId', { partnerId })
    .getMany();
}

async getArchiveByUserRole(user: User): Promise<Project[]> {
  if (!user) return [];

  const isClient = user.role?.name.toLowerCase().startsWith('client');

  const qb = this.projectRepo
    .createQueryBuilder('project')
    .leftJoinAndSelect('project.order', 'order')
    .leftJoinAndSelect('order.user', 'user')
    .leftJoinAndSelect('user.partner', 'partner');

  if (isClient) {
    qb.where('user.id = :userId', { userId: user.id })
      .andWhere('project.archiverc = :archived', { archived: true });
  } else {
    qb.where('project.archivera = :archived', { archived: true });
  }

  qb.orderBy('project.updatedAt', 'DESC')
    .addOrderBy('project.createdAt', 'DESC');

  return qb.getMany();
}


}
