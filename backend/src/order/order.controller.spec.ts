import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../users/entities/users.entity';
import { Order } from './entities/order.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  const mockOrderService = {
    addOrder: jest.fn(),
    updateOrder: jest.fn(),
    getAllOrders: jest.fn(),
    getOrderById: jest.fn(),
    deleteOrder: jest.fn(),
    getOrdersByUser: jest.fn(),
    changeStatus: jest.fn(),
    archivera: jest.fn(),
    archiverc: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        { provide: OrderService, useValue: mockOrderService },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addOrder', () => {
    it('should add an order and return it', async () => {
      const idUser = 1;
      const orderData: Partial<Order> = { orderName: 'Test Order' };
      const order: Order = {
        idOrder: 1,
        orderName: 'Test Order',
        attachementName: '',
        annuler: false,
        archivera: false,
        archiverc: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {} as any,
        projects: [] as any,
        devis: null,
        discussion: null,
      };

      mockOrderService.addOrder.mockResolvedValue(order);

      await expect(controller.addOrder(orderData, idUser)).resolves.toEqual(order);
      expect(mockOrderService.addOrder).toHaveBeenCalledWith(orderData, idUser);
    });
  });

  describe('updateOrder', () => {
    it('should update and return the order', async () => {
      const id = 1;
      const orderData: Partial<Order> = { orderName: 'Updated Order' };
      const updatedOrder: Order = {
        idOrder: id,
        orderName: 'Updated Order',
        attachementName: '',
        annuler: false,
        archivera: false,
        archiverc: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {} as any,
        projects: [] as any,
        devis: null,
        discussion: null,
      };

      mockOrderService.updateOrder.mockResolvedValue(updatedOrder);

      await expect(controller.updateOrder(id, orderData)).resolves.toEqual(updatedOrder);
      expect(mockOrderService.updateOrder).toHaveBeenCalledWith(id, orderData);
    });
  });

  describe('getAllOrders', () => {
    it('should return all orders', async () => {
      const orders: Order[] = [
        {
          idOrder: 1,
          orderName: 'Order 1',
          attachementName: '',
          annuler: false,
          archivera: false,
          archiverc: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {} as any,
          projects: [] as any,
          devis: null,
          discussion: null,
        },
        {
          idOrder: 2,
          orderName: 'Order 2',
          attachementName: '',
          annuler: false,
          archivera: false,
          archiverc: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {} as any,
          projects: [] as any,
          devis: null,
          discussion: null,
        },
      ];

      mockOrderService.getAllOrders.mockResolvedValue(orders);

      await expect(controller.getAllOrders()).resolves.toEqual(orders);
      expect(mockOrderService.getAllOrders).toHaveBeenCalled();
    });
  });

  describe('getOrderById', () => {
    it('should return order by id', async () => {
      const id = 1;
      const order: Order = {
        idOrder: id,
        orderName: 'Order 1',
        attachementName: '',
        annuler: false,
        archivera: false,
        archiverc: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {} as any,
        projects: [] as any,
        devis: null,
        discussion: null,
      };

      mockOrderService.getOrderById.mockResolvedValue(order);

      await expect(controller.getOrderById(id)).resolves.toEqual(order);
      expect(mockOrderService.getOrderById).toHaveBeenCalledWith(id);
    });
  });

  describe('deleteOrder', () => {
    it('should delete an order', async () => {
      const id = 1;
      mockOrderService.deleteOrder.mockResolvedValue(undefined);

      await expect(controller.deleteOrder(id)).resolves.toBeUndefined();
      expect(mockOrderService.deleteOrder).toHaveBeenCalledWith(id);
    });
  });

  describe('getOrdersByUser', () => {
    it('should return orders for a user', async () => {
      const userId = 1;
      const orders: Order[] = [
        {
          idOrder: 1,
          orderName: 'Order 1',
          attachementName: '',
          annuler: false,
          archivera: false,
          archiverc: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {} as any,
          projects: [] as any,
          devis: null,
          discussion: null,
        },
      ];

      mockOrderService.getOrdersByUser.mockResolvedValue(orders);

      await expect(controller.getOrdersByUser(userId)).resolves.toEqual(orders);
      expect(mockOrderService.getOrdersByUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('changeStatus', () => {
    it('should change status of order and return it', async () => {
      const id = 1;
      const order: Order = {
        idOrder: id,
        orderName: 'Order 1',
        attachementName: '',
        annuler: false,
        archivera: false,
        archiverc: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {} as any,
        projects: [] as any,
        devis: null,
        discussion: null,
      };

      mockOrderService.changeStatus.mockResolvedValue(order);

      await expect(controller.changeStatus(id)).resolves.toEqual(order);
      expect(mockOrderService.changeStatus).toHaveBeenCalledWith(id);
    });
  });

  describe('archivera', () => {
    it('should archive order a if user role is ADMIN and return it', async () => {
      const id = 1;
      const user = { id: 1, role: { name: 'ADMIN' } } as User;
      const order: Order = {
        idOrder: id,
        orderName: 'Order 1',
        attachementName: '',
        annuler: false,
        archivera: true,
        archiverc: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {} as any,
        projects: [] as any,
        devis: null,
        discussion: null,
      };

      mockOrderService.archivera.mockResolvedValue(order);

      await expect(controller.archivera(id, user)).resolves.toEqual(order);
      expect(mockOrderService.archivera).toHaveBeenCalledWith(id);
    });

    it('should archive order c if user role is CLIENT and return it', async () => {
      const id = 1;
      const user = { id: 1, role: { name: 'CLIENT_USER' } } as User;
      const order: Order = {
        idOrder: id,
        orderName: 'Order 1',
        attachementName: '',
        annuler: false,
        archivera: false,
        archiverc: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {} as any,
        projects: [] as any,
        devis: null,
        discussion: null,
      };

      mockOrderService.archiverc.mockResolvedValue(order);

      await expect(controller.archivera(id, user)).resolves.toEqual(order);
      expect(mockOrderService.archiverc).toHaveBeenCalledWith(id);
    });
  });

  describe('archiverc', () => {
    it('should archive order c if user role is CLIENT and return it', async () => {
      const id = 1;
      const user = { id: 1, role: { name: 'CLIENT_USER' } } as User;
      const order: Order = {
        idOrder: id,
        orderName: 'Order 1',
        attachementName: '',
        annuler: false,
        archivera: false,
        archiverc: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {} as any,
        projects: [] as any,
        devis: null,
        discussion: null,
      };

      mockOrderService.archiverc.mockResolvedValue(order);

      await expect(controller.archiverc(id, user)).resolves.toEqual(order);
      expect(mockOrderService.archiverc).toHaveBeenCalledWith(id);
    });

    it('should archive order a if user role is ADMIN and return it', async () => {
      const id = 1;
      const user = { id: 1, role: { name: 'ADMIN' } } as User;
      const order: Order = {
        idOrder: id,
        orderName: 'Order 1',
        attachementName: '',
        annuler: false,
        archivera: true,
        archiverc: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {} as any,
        projects: [] as any,
        devis: null,
        discussion: null,
      };

      mockOrderService.archivera.mockResolvedValue(order);

      await expect(controller.archiverc(id, user)).resolves.toEqual(order);
      expect(mockOrderService.archivera).toHaveBeenCalledWith(id);
    });
  });
});
