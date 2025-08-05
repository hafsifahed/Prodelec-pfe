import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CahierDesCharges } from '../cahier-des-charges/entities/cahier-des-charge.entity';
import { Devis } from '../devis/entities/devi.entity';
import { Order } from '../order/entities/order.entity';
import { Project } from '../project/entities/project.entity';
import { Role } from '../roles/enums/roles.enum';
import { User } from '../users/entities/users.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { TransitionPhaseDto } from './dto/transition-phase.dto';
import { WorkflowDiscussion, WorkflowPhase } from './entities/workflow-discussion.entity';
import { WorkflowMessage, WorkflowMessageType } from './entities/workflow-message.entity';

@Injectable()
export class WorkflowDiscussionService {
  constructor(
    @InjectRepository(WorkflowDiscussion)
    private discussionRepo: Repository<WorkflowDiscussion>,

    @InjectRepository(WorkflowMessage)
    private messageRepo: Repository<WorkflowMessage>,

    @InjectRepository(CahierDesCharges)
    private cdcRepo: Repository<CahierDesCharges>,

    @InjectRepository(Devis)
    private devisRepo: Repository<Devis>,

    @InjectRepository(Order)
    private orderRepo: Repository<Order>,

    @InjectRepository(Project)
    private projectRepo: Repository<Project>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async createDiscussionForCDC(cdcId: number): Promise<WorkflowDiscussion> {
    const cdc = await this.cdcRepo.findOne({ where: { id: cdcId } });
    if (!cdc) throw new NotFoundException('CDC not found');

    const discussion = this.discussionRepo.create({
      cdc,
      currentPhase: WorkflowPhase.CDC,
    });

    return this.discussionRepo.save(discussion);
  }

  async validateParticipant(discussionId: number, userId: number): Promise<void> {
    const discussion = await this.discussionRepo.findOne({
      where: { id: discussionId },
      relations: [
        'cdc',
        'cdc.user',
        'devis',
        'devis.user',
        'orders',
        'orders.user',
        'projects',
        'projects.order',
        'projects.order.user',
      ],
    });
    if (!discussion) throw new NotFoundException('Discussion not found');

    const participants = new Set<number>();

    if (discussion.cdc?.user) participants.add(discussion.cdc.user.id);
    if (discussion.devis?.user) participants.add(discussion.devis.user.id);
    discussion.orders?.forEach((order) => {
      if (order.user) participants.add(order.user.id);
    });
    discussion.projects?.forEach((project) => {
      if (project.order?.user) participants.add(project.order.user.id);
    });

    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['role'],
    });
    if (!user) throw new UnauthorizedException('User not found');
    if (
      user.role?.name === Role.RESPONSABLE_INDUSTRIALISATION ||
      user.role?.name === Role.ADMIN
    ) {
      return; // Bypass for special roles
    }

    if (!participants.has(userId))
      throw new UnauthorizedException('Access denied: Not a participant');
  }

  async addMessage(
    discussionId: number,
    dto: CreateMessageDto,
    author: User,
  ): Promise<WorkflowMessage> {
    await this.validateParticipant(discussionId, author.id);

    const discussion = await this.discussionRepo.findOne({ where: { id: discussionId } });
    if (!discussion) throw new NotFoundException('Discussion not found');

    const content = dto.content?.trim();
    if (!content) throw new BadRequestException('Message content cannot be empty');

    const message = this.messageRepo.create({
      content,
      author,
      discussion,
      type: WorkflowMessageType.MESSAGE,
    });

    return this.messageRepo.save(message);
  }

  async transitionPhase(
    discussionId: number,
    dto: TransitionPhaseDto,
  ): Promise<WorkflowDiscussion> {
    const discussion = await this.discussionRepo.findOne({
      where: { id: discussionId },
      relations: ['cdc', 'devis', 'orders', 'projects'],
    });

    if (!discussion) throw new NotFoundException('Discussion not found');

    if (dto.targetEntityId) {
      switch (dto.targetPhase) {
        case WorkflowPhase.DEVIS:
          const devis = await this.devisRepo.findOne({ where: { id: dto.targetEntityId } });
          if (!devis) throw new NotFoundException('Devis not found');
          discussion.devis = devis;
          break;

        case WorkflowPhase.ORDER:
          const order = await this.orderRepo.findOne({ where: { idOrder: dto.targetEntityId } });
          if (!order) throw new NotFoundException('Order not found');
          if (!discussion.orders) discussion.orders = [];
          // Avoid duplicates
          if (!discussion.orders.find((o) => o.idOrder === order.idOrder)) {
            discussion.orders.push(order);
          }
          break;

        case WorkflowPhase.PROJECT:
          const project = await this.projectRepo.findOne({ where: { idproject: dto.targetEntityId } });
          if (!project) throw new NotFoundException('Project not found');
          if (!discussion.projects) discussion.projects = [];
          if (!discussion.projects.find((p) => p.idproject === project.idproject)) {
            discussion.projects.push(project);
          }
          break;

        default:
          throw new BadRequestException('Invalid target phase');
      }
    }

    discussion.currentPhase = dto.targetPhase;
    return this.discussionRepo.save(discussion);
  }

  async getAllDiscussions(): Promise<WorkflowDiscussion[]> {
  return this.discussionRepo.find({
    relations: [
      'cdc', 'cdc.user',
      'devis', 'devis.user',
      'orders', 'orders.user',
      'projects', 'projects.order', 'projects.order.user',
      'messages', 'messages.author',
    ],
    order: {
      createdAt: 'DESC',
      messages: { createdAt: 'ASC' }
    }
  });
}

async getDiscussionsByUser(userId: number): Promise<WorkflowDiscussion[]> {
  return this.discussionRepo
    .createQueryBuilder('discussion')
    .leftJoinAndSelect('discussion.cdc', 'cdc')
    .leftJoinAndSelect('cdc.user', 'cdcUser')
    .leftJoinAndSelect('discussion.devis', 'devis')
    .leftJoinAndSelect('devis.user', 'devisUser')
    .leftJoinAndSelect('discussion.orders', 'orders')
    .leftJoinAndSelect('orders.user', 'ordersUser')
    .leftJoinAndSelect('discussion.projects', 'projects')
    .leftJoinAndSelect('projects.order', 'projectOrder')
    .leftJoinAndSelect('projectOrder.user', 'projectOrderUser')
    .leftJoinAndSelect('discussion.messages', 'messages')
    .leftJoinAndSelect('messages.author', 'messagesAuthor')
    .where('cdcUser.id = :userId OR devisUser.id = :userId OR ordersUser.id = :userId OR projectOrderUser.id = :userId', { userId })
    .orderBy('discussion.createdAt', 'DESC')
    .addOrderBy('messages.createdAt', 'ASC')
    .getMany();
}


  async getFullDiscussion(discussionId: number): Promise<WorkflowDiscussion> {
    return this.discussionRepo.findOne({
      where: { id: discussionId },
      relations: [
        'cdc',
        'cdc.user',
        'devis',
        'devis.user',
        'orders',
        'orders.user',
        'projects',
        'projects.order',
        'projects.order.user',
        'messages',
        'messages.author',
      ],
      order: {
        messages: { createdAt: 'ASC' },
        orders: { idOrder: 'ASC' },
        projects: { idproject: 'ASC' },
      },
    });
  }

  // Additional helpers by linked entities

  async getDiscussionByDevis(devisId: number): Promise<WorkflowDiscussion> {
    const devis = await this.devisRepo.findOne({
      where: { id: devisId },
      relations: ['cahierDesCharges'],
    });
    if (!devis) throw new NotFoundException(`Devis with ID ${devisId} not found`);

    const discussion = await this.discussionRepo.findOne({
      where: { cdc: { id: devis.cahierDesCharges.id } },
      relations: ['cdc'],
    });

    if (!discussion) {
      throw new NotFoundException(`Discussion not found for CDC linked to devis ${devisId}`);
    }

    return discussion;
  }

  async getDiscussionByOrder(orderId: number): Promise<WorkflowDiscussion> {
    const order = await this.orderRepo.findOne({
      where: { idOrder: orderId },
      relations: ['devis', 'devis.cahierDesCharges'],
    });

    if (!order || !order.devis) {
      throw new NotFoundException(`Order or linked devis not found for order ID ${orderId}`);
    }

    return this.getDiscussionByDevis(order.devis.id);
  }

  async getDiscussionByProject(projectId: number): Promise<WorkflowDiscussion> {
    const project = await this.projectRepo.findOne({
      where: { idproject: projectId },
      relations: ['order', 'order.devis', 'order.devis.cahierDesCharges'],
    });

    if (!project || !project.order || !project.order.devis) {
      throw new NotFoundException(`Project or linked order/devis not found for project ID ${projectId}`);
    }

    return this.getDiscussionByDevis(project.order.devis.id);
  }
}
