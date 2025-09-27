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
import { WorkflowDiscussionSidebar } from './dto/workflow-discussion.dto';
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
    phase: discussion.currentPhase,
          read: false 
  });

  const saved = await this.messageRepo.save(message);

  // 🔥 Recharger avec relation auteur complète
  return this.messageRepo.findOne({
    where: { id: saved.id },
    relations: ['author'],
  });
}

async markMessagesAsRead(discussionId: number, userId: number): Promise<void> {
    await this.messageRepo
      .createQueryBuilder()
      .update(WorkflowMessage)
      .set({ read: true })
      .where('discussionId = :discussionId', { discussionId })
      .andWhere('authorId != :userId', { userId }) // Seulement les messages des autres
      .andWhere('read = false')
      .execute();
  }

 


  async transitionPhase(
    cdcId: number,
    dto: TransitionPhaseDto,
  ): Promise<WorkflowDiscussion> {
    const discussion = await this.discussionRepo.findOne({
      where: { cdc:  { id: cdcId } },
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
          //if (!order) throw new NotFoundException('Order not found');
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

async getAllDiscussions(
  page = 1,
  limit = 20,
      currentUserId?: number // Ajouter ce paramètre optionnel
): Promise<{ discussions: WorkflowDiscussionSidebar[]; total: number }> {
  // QueryBuilder pour charger discussions + relations usuelles
  const qb = this.discussionRepo
    .createQueryBuilder('discussion')
    .leftJoinAndSelect('discussion.cdc', 'cdc')
    .leftJoinAndSelect('discussion.devis', 'devis')
    .leftJoinAndSelect('discussion.orders', 'orders')
    .leftJoinAndSelect('discussion.projects', 'projects')

    // Jointure conditionnelle sur dernier message par discussion
    .leftJoinAndSelect(
      'discussion.messages',
      'lastMessage',
      `lastMessage.id = (
        SELECT MAX(sub.id)
        FROM workflow_messages sub
        WHERE sub.discussionId = discussion.id
      )`,
    )
    .leftJoinAndSelect('lastMessage.author', 'messageAuthor')

    .orderBy('discussion.createdAt', 'DESC')
    .skip((page - 1) * limit)
    .take(limit);

  const [discussions, total] = await qb.getManyAndCount();

  // Formater chaque discussion avec la méthode private
      const formatted = discussions.map(d => this.formatForSidebar(d, currentUserId));


  return {
    discussions: formatted,
    total,
  };
}


async getDiscussionsByUser(
  userId: number,
  page = 1,
  limit = 20,
): Promise<{ discussions: WorkflowDiscussionSidebar[]; total: number }> {
  const qb = this.discussionRepo.createQueryBuilder('discussion');

  qb
    .leftJoinAndSelect('discussion.cdc', 'cdc')
    .leftJoin('cdc.user', 'cdcUser')
    .leftJoinAndSelect('discussion.devis', 'devis')
    .leftJoin('devis.user', 'devisUser')
    .leftJoinAndSelect('discussion.orders', 'orders')
    .leftJoin('orders.user', 'ordersUser')
    .leftJoinAndSelect('discussion.projects', 'projects')
    .leftJoin('projects.order', 'projectOrder')
    .leftJoin('projectOrder.user', 'projectOrderUser')

    .leftJoinAndSelect(
      'discussion.messages',
      'lastMessage',
      `lastMessage.id = (
        SELECT MAX(sub.id)
        FROM workflow_messages sub
        WHERE sub.discussionId = discussion.id
      )`,
    )
    .leftJoinAndSelect('lastMessage.author', 'messageAuthor')

    .where('cdcUser.id = :userId', { userId })
    .orWhere('devisUser.id = :userId', { userId })
    .orWhere('ordersUser.id = :userId', { userId })
    .orWhere('projectOrderUser.id = :userId', { userId })

    .orderBy('discussion.createdAt', 'DESC')
    .skip((page - 1) * limit)
    .take(limit);

  const [discussions, total] = await qb.getManyAndCount();

  return {
          discussions: discussions.map(d => this.formatForSidebar(d, userId)),
    total,
  };
}





private formatForSidebar(discussion: WorkflowDiscussion, currentUserId?: number): WorkflowDiscussionSidebar {
    const unreadCount = discussion.messages?.filter(
      msg => !msg.read && msg.author.id !== currentUserId
    ).length || 0;
    console.log('unreadCount', unreadCount);

    return {
      id: discussion.id,
      currentPhase: discussion.currentPhase,
      createdAt: discussion.createdAt,
      cdc: {
        id: discussion.cdc.id,
        titre: discussion.cdc.titre
      },
      devis: discussion.devis ? {
        id: discussion.devis.id,
        numdevis: discussion.devis.numdevis
      } : undefined,
      orders: discussion.orders?.map(order => ({
        idOrder: order.idOrder,
        orderName: order.orderName
      })),
      projects: discussion.projects?.map(project => ({
        idproject: project.idproject,
        refClient: project.refClient
      })),
      lastMessage: discussion.messages?.[0] ? {
        id: discussion.messages[0].id,
        content: discussion.messages[0].content,
        author: {
          id: discussion.messages[0].author.id,
          firstName: discussion.messages[0].author.firstName,
          lastName: discussion.messages[0].author.lastName
        },
        createdAt: discussion.messages[0].createdAt,
        read: discussion.messages[0].read // Ajouter l'état de lecture
      } : null,
      unreadCount // Ajouter le compteur
    };
  }

async getLastMessage(discussionId: number): Promise<WorkflowMessage | null> {
  return this.messageRepo.findOne({
    where: { discussion: { id: discussionId } },
    order: { createdAt: 'DESC' },
    relations: ['author']
  });
}

  async getDiscussion(discussionId: number, currentUserId?: number): Promise<WorkflowDiscussion> {
    // Marquer les messages comme lus quand l'utilisateur ouvre la discussion
    if (currentUserId) {
      await this.markMessagesAsRead(discussionId, currentUserId);
    }

    return this.discussionRepo
      .createQueryBuilder('discussion')
      .leftJoinAndSelect('discussion.cdc', 'cdc')
      .leftJoinAndSelect('cdc.user', 'cdcUser')
      .leftJoinAndSelect('discussion.devis', 'devis')
      .leftJoinAndSelect('devis.user', 'devisUser')
      .leftJoinAndSelect('discussion.orders', 'orders')
      .leftJoinAndSelect('orders.user', 'orderUser')
      .leftJoinAndSelect('orders.projects', 'orderProjects')
      .leftJoinAndSelect('discussion.projects', 'projects')
      .leftJoinAndSelect('projects.order', 'projectOrder')
      .leftJoinAndSelect('projectOrder.user', 'projectOrderUser')
      .leftJoinAndSelect('discussion.messages', 'messages')
      .leftJoinAndSelect('messages.author', 'messageAuthor')
      .where('discussion.id = :id', { id: discussionId })
      .orderBy('messages.createdAt', 'ASC')
      .addOrderBy('orders.idOrder', 'ASC')
      .addOrderBy('projects.idproject', 'ASC')
      .getOne();
  }

    async getFullDiscussion(discussionId: number): Promise<WorkflowDiscussion> {
  return this.discussionRepo
    .createQueryBuilder('discussion')
    .leftJoinAndSelect('discussion.cdc', 'cdc')
    .leftJoinAndSelect('cdc.user', 'cdcUser')
    .leftJoinAndSelect('discussion.devis', 'devis')
    .leftJoinAndSelect('devis.user', 'devisUser')
    .leftJoinAndSelect('discussion.orders', 'orders')
    .leftJoinAndSelect('orders.user', 'orderUser')
    .leftJoinAndSelect('orders.projects', 'projects')
    .leftJoinAndSelect('projects.order', 'projectOrder')
    .leftJoinAndSelect('projectOrder.user', 'projectOrderUser')
   
    .where('discussion.id = :id', { id: discussionId })
    .addOrderBy('orders.idOrder', 'ASC')
    .addOrderBy('projects.idproject', 'ASC')
    .addOrderBy('projects.createdAt', 'ASC')
    .getOne();
}


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
