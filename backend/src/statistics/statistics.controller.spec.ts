import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../users/entities/users.entity';
import { StatisticsController } from './statistics.controller';
import { GlobalStats, StatisticsService } from './statistics.service';

describe('StatisticsController', () => {
  let controller: StatisticsController;
  let service: StatisticsService;

  const mockStatisticsService = {
    getGlobalStats: jest.fn(),
    getGlobalStatsUser: jest.fn(),
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
    it('should call getGlobalStatsUser if user role starts with CLIENT', async () => {
      const user = { id: 1, role: { name: 'CLIENT_USER' } } as User;
      const mockStats: GlobalStats = {
        totalOrders: 5,
        cancelledOrders: 1,
        totalProjects: 3,
        completedProjects: 2,
        lateProjects: 1,
        averageAvis: 4.5,
        reclamationRatio: 33.33,
      };
      mockStatisticsService.getGlobalStatsUser.mockResolvedValue(mockStats);

      await expect(controller.getGlobal(user)).resolves.toEqual(mockStats);
      expect(mockStatisticsService.getGlobalStatsUser).toHaveBeenCalledWith(user.id);
      expect(mockStatisticsService.getGlobalStats).not.toHaveBeenCalled();
    });

    it('should call getGlobalStats if user role does not start with CLIENT', async () => {
      const user = { id: 1, role: { name: 'ADMIN' } } as User;
      const mockStats: GlobalStats = {
        totalOrders: 10,
        cancelledOrders: 2,
        totalProjects: 5,
        completedProjects: 4,
        lateProjects: 1,
        averageAvis: 4.7,
        reclamationRatio: 40,
      };
      mockStatisticsService.getGlobalStats.mockResolvedValue(mockStats);

      await expect(controller.getGlobal(user)).resolves.toEqual(mockStats);
      expect(mockStatisticsService.getGlobalStats).toHaveBeenCalled();
      expect(mockStatisticsService.getGlobalStatsUser).not.toHaveBeenCalled();
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
      expect(mockStatisticsService.searchAllUser).toHaveBeenCalledWith(keyword, user.id);
      expect(mockStatisticsService.searchAll).not.toHaveBeenCalled();
    });

    it('should call searchAll if user role does not start with CLIENT', async () => {
      const user = { id: 1, role: { name: 'ADMIN' } } as User;
      const keyword = 'test';
      const query = { keyword };
      const mockResult = { projects: [], devis: [], partners: [] };
      mockStatisticsService.searchAll.mockResolvedValue(mockResult);

      await expect(controller.search(query, user)).resolves.toEqual(mockResult);
      expect(mockStatisticsService.searchAll).toHaveBeenCalledWith(keyword);
      expect(mockStatisticsService.searchAllUser).not.toHaveBeenCalled();
    });
  });
});
