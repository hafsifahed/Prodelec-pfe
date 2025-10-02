import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../users/entities/users.entity';
import { StatisticsController } from './statistics.controller';
import { GlobalStats, StatisticsService } from './statistics.service';

describe('StatisticsController', () => {
  let controller: StatisticsController;
  let service: StatisticsService;

  const mockStatisticsService = {
    getGlobalStats: jest.fn(),
    getComparativeStats: jest.fn(),
    getAvailableYears: jest.fn(),
    searchAll: jest.fn(),
    searchAllUser: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks(); // Clear all mocks before each test

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatisticsController],
      providers: [
        {
          provide: StatisticsService,
          useValue: mockStatisticsService,
        },
      ],
    }).compile();

    controller = module.get<StatisticsController>(StatisticsController);
    service = module.get<StatisticsService>(StatisticsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getGlobal', () => {
    it('should call getGlobalStats with user id if role starts with CLIENT', async () => {
      const user = { id: 1, role: { name: 'CLIENT_USER' } } as User;
      const period = 'month';
      const year = 2025;
      const mockStats: GlobalStats = {
        totalOrders: 5,
        cancelledOrders: 1,
        totalProjects: 3,
        completedProjects: 2,
        lateProjects: 1,
        averageAvis: 4.5,
        totalAvis:4,
        reclamationRatio: 33.33,
      };
      mockStatisticsService.getGlobalStats.mockResolvedValue(mockStats);

      await expect(controller.getGlobal(period, user, year)).resolves.toEqual(mockStats);
      expect(mockStatisticsService.getGlobalStats).toHaveBeenCalledWith(period, user.id, year);
    });

    it('should call getGlobalStats with undefined user id if role does not start with CLIENT', async () => {
      const user = { id: 1, role: { name: 'ADMIN' } } as User;
      const period = 'month';
      const year = 2025;
      const mockStats: GlobalStats = {
        totalOrders: 10,
        cancelledOrders: 2,
        totalProjects: 5,
        completedProjects: 4,
        lateProjects: 1,
        totalAvis:4,
        averageAvis: 4.7,
        reclamationRatio: 40,
      };
      mockStatisticsService.getGlobalStats.mockResolvedValue(mockStats);

      await expect(controller.getGlobal(period, user, year)).resolves.toEqual(mockStats);
      expect(mockStatisticsService.getGlobalStats).toHaveBeenCalledWith(period, undefined, year);
    });
  });

  describe('search', () => {
    it('should call searchAllUser if user role starts with CLIENT', async () => {
      const user = { id: 1, role: { name: 'CLIENT_PATIENT' } } as User;
      const keyword = 'test';
      const query = { keyword };
      const mockResult = { projects: [], devis: [], partners: [] };
      mockStatisticsService.searchAllUser.mockResolvedValue(mockResult);

      await expect(controller.search(query, user)).resolves.toEqual(mockResult);
      expect(mockStatisticsService.searchAllUser).toHaveBeenCalledWith(keyword.trim(), user.id);
      expect(mockStatisticsService.searchAll).not.toHaveBeenCalled();
    });

    it('should call searchAll if user role does not start with CLIENT', async () => {
      const user = { id: 1, role: { name: 'ADMIN' } } as User;
      const keyword = 'test';
      const query = { keyword };
      const mockResult = { projects: [], devis: [], partners: [] };
      mockStatisticsService.searchAll.mockResolvedValue(mockResult);

      await expect(controller.search(query, user)).resolves.toEqual(mockResult);
      expect(mockStatisticsService.searchAll).toHaveBeenCalledWith(keyword.trim());
      expect(mockStatisticsService.searchAllUser).not.toHaveBeenCalled();
    });
  });
});
