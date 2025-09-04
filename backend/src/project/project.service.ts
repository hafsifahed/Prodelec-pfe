import {
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NotificationsService } from '../notifications/notifications.service';
import { Order } from '../order/entities/order.entity';
import { User } from '../users/entities/users.entity';
import { WorkflowPhase } from '../workflow-discussion/entities/workflow-discussion.entity';
import { WorkflowDiscussionService } from '../workflow-discussion/workflow-discussion.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)  private projectRepo: Repository<Project>,
    @InjectRepository(Order)    private orderRepo  : Repository<Order>,
    @InjectRepository(User)     private userRepo   : Repository<User>,
    private readonly notifSrv: NotificationsService,
        private readonly workflowDiscussionService: WorkflowDiscussionService
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

  const project = this.projectRepo.create(dto); // remplit l’entité

  project.order                   = order;
  project.conceptionResponsible   = conceptionResp   ? await this.workerByUsername(conceptionResp)   : null;
  project.methodeResponsible      = methodeResp      ? await this.workerByUsername(methodeResp)      : null;
  project.productionResponsible   = productionResp   ? await this.workerByUsername(productionResp)   : null;
  project.finalControlResponsible = finalControlResp ? await this.workerByUsername(finalControlResp) : null;
  project.deliveryResponsible     = deliveryResp     ? await this.workerByUsername(deliveryResp)     : null;


  project.conceptionExist = dto.conceptionExist ?? false;
  project.methodeExist = dto.methodeExist ?? false;
  project.productionExist = dto.productionExist ?? false;
  project.finalControlExist = dto.finalControlExist ?? false;
  project.deliveryExist = dto.deliveryExist ?? false;


  const saved = await this.projectRepo.save(project);
  await this.notifyResponsibles(
    saved,
    'Nouveau projet créé',
    `Le projet #${saved.idproject} vous est assigné.`,
  );

  // Lier à la discussion existante
    if (order.devis) {
      const discussion = await this.workflowDiscussionService.getDiscussionByDevis(order.devis.id);
      await this.workflowDiscussionService.transitionPhase(
        discussion.cdc.id,
        {
          targetPhase: WorkflowPhase.PROJECT,
          targetEntityId: saved.idproject
        }
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
  const proj = await this.projectRepo.findOne({ where: { idproject: projectId }, relations: [
    'conceptionResponsible',
    'methodeResponsible',
    'productionResponsible',
    'finalControlResponsible',
    'deliveryResponsible',
  ] });
  if (!proj) throw new NotFoundException('Project not found');

  // Sauvegarder les responsables actuels
  const oldResponsables = [
    proj.conceptionResponsible?.id,
    proj.methodeResponsible?.id,
    proj.productionResponsible?.id,
    proj.finalControlResponsible?.id,
    proj.deliveryResponsible?.id,
  ].filter(id => id != null);

  Object.assign(proj, dto);

  proj.conceptionResponsible   = await this.workerByUsername(conceptionResp);
  proj.methodeResponsible      = await this.workerByUsername(methodeResp);
  proj.productionResponsible   = await this.workerByUsername(productionResp);
  proj.finalControlResponsible = await this.workerByUsername(finalControlResp);
  proj.deliveryResponsible     = await this.workerByUsername(deliveryResp);

  const saved = await this.projectRepo.save(proj);

  // Nouveaux responsables après mise à jour
  const newResponsables = [
    saved.conceptionResponsible?.id,
    saved.methodeResponsible?.id,
    saved.productionResponsible?.id,
    saved.finalControlResponsible?.id,
    saved.deliveryResponsible?.id,
  ].filter(id => id != null);

  // Trouver les responsables ajoutés (présents dans new mais pas dans old)
  const addedResponsablesIds = newResponsables.filter(id => !oldResponsables.includes(id));

  // Récupérer les entités User des nouveaux responsables
  const addedResponsables = [];
  for (const id of addedResponsablesIds) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (user) addedResponsables.push(user);
  }

  // Envoyer notification uniquement aux nouveaux responsables
  for (const user of addedResponsables) {
    await this.notifSrv.createAndSendNotification(user, 'Nouveau projet assigné', `Vous avez été ajouté comme responsable du projet #${saved.idproject}`, { projectId: saved.idproject });
  }

  return saved;
}


// Méthode utilitaire pour notifier tous les responsables
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
    .leftJoinAndSelect('user.role', 'role') // ajout relation partner
    .leftJoinAndSelect('project.conceptionResponsible', 'conceptionResponsible')
    .leftJoinAndSelect('project.methodeResponsible', 'methodeResponsible')
    .leftJoinAndSelect('project.productionResponsible', 'productionResponsible')
    .leftJoinAndSelect('project.finalControlResponsible', 'finalControlResponsible')
    .leftJoinAndSelect('project.deliveryResponsible', 'deliveryResponsible')
    .where('partner.id = :partnerId', { partnerId })
    .getMany();
}
}
