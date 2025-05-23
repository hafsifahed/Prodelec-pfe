import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/users.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async addOrder(orderData: Partial<Order>, idUser: number): Promise<Order> {
    const user = await this.userRepo.findOne({ where: { id: idUser } });
    if (!user) throw new NotFoundException(`User not found with id: ${idUser}`);

    const order = this.orderRepo.create({ ...orderData, user });
    return this.orderRepo.save(order);
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
    const user = await this.userRepo.findOne({ where: { id: idUser } });
    if (!user) throw new NotFoundException(`User not found with id: ${idUser}`);
    return this.orderRepo.find({ where: { user } });
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
