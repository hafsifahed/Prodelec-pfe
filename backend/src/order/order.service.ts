import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Devis } from '../devis/entities/devi.entity';
import { User } from '../users/entities/users.entity';
import { WorkflowPhase } from '../workflow-discussion/entities/workflow-discussion.entity';
import { WorkflowDiscussionService } from '../workflow-discussion/workflow-discussion.service';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Devis)
  private readonly devisRepo: Repository<Devis>,
      private workflowDiscussionService: WorkflowDiscussionService

  ) {}

  async addOrder(orderData: Partial<Order>, idUser: number): Promise<Order> {
  const user = await this.userRepo.findOne({ where: { id: idUser } });
  if (!user) throw new NotFoundException(`User not found with id: ${idUser}`);

  let devis: Devis = null;
  if (orderData.devis && orderData.devis.id) {
    devis = await this.devisRepo.findOne({ where: { id: orderData.devis.id } });
    if (!devis) throw new NotFoundException(`Devis not found with id: ${orderData.devis.id}`);
  }

  const order = this.orderRepo.create({ 
    ...orderData, 
    user,
    devis,
  });

  const savedOrder =  await this.orderRepo.save(order);
   if (devis) {
      const discussion = await this.workflowDiscussionService.getDiscussionByDevis(devis.id);
      await this.workflowDiscussionService.transitionPhase(
        discussion.id, 
        { 
          targetPhase: WorkflowPhase.ORDER, 
          targetEntityId: savedOrder.idOrder
        }
      );
    }
  return savedOrder;
}

  async updateOrder(orderId: number, orderData: Partial<Order>): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { idOrder: orderId } });
    if (!order) throw new NotFoundException(`Order not found with id: ${orderId}`);

    Object.assign(order, orderData);
    return this.orderRepo.save(order);
  }

  async getAllOrders(): Promise<Order[]> {
    return this.orderRepo.find();
  }
/**const order = await this.orderRepo.findOne({
  where: { idOrder },
  relations: ['user', 'devis'],
});
 */
  async getOrderById(idOrder: number): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { idOrder } });
    if (!order) throw new NotFoundException(`Order not found with id: ${idOrder}`);
    return order;
  }

  async deleteOrder(idOrder: number): Promise<void> {
    const exists = await this.orderRepo.findOne({ where: { idOrder } });
    if (!exists) throw new NotFoundException(`Order not found with id: ${idOrder}`);
    await this.orderRepo.delete(idOrder);
  }

  async getOrdersByUser(idUser: number): Promise<Order[]> {
  const exists = await this.userRepo.findOne({ where: { id: idUser } });
  if (!exists) throw new NotFoundException(`User not found with id: ${idUser}`);

  return this.orderRepo.find({
    where: { user: { id: idUser } },
    relations: ['user'],
  });
}

  async changeStatus(idOrder: number): Promise<Order> {
    const order = await this.getOrderById(idOrder);
    order.annuler = !order.annuler;
    return this.orderRepo.save(order);
  }

  async archivera(idOrder: number): Promise<Order> {
    const order = await this.getOrderById(idOrder);
    order.archivera = !order.archivera;
    return this.orderRepo.save(order);
  }

  async archiverc(idOrder: number): Promise<Order> {
    const order = await this.getOrderById(idOrder);
    order.archiverc = !order.archiverc;
    return this.orderRepo.save(order);
  }
}
