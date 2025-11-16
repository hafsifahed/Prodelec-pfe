import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../users/entities/users.entity';
import { ChartsStatisticsService } from './charts-statistics.service';
import { ChartsFilterDto } from './dto/charts-filter.dto';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

describe('StatisticsController', () => {
  let controller: StatisticsController;
  let statisticsService: StatisticsService;
  let chartsStatisticsService: ChartsStatisticsService;

  const mockStatisticsService = {
    getGlobalStats: jest.fn(),
    getComparativeStats: jest.fn(),
    getAvailableYears: jest.fn(),
    searchAll: jest.fn(),
    searchAllUser: jest.fn(),
  };

  const mockChartsStatisticsService = {
    getChartsStatistics: jest.fn(),
    getFilterOptions: jest.fn(),
  };

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: { name: 'CLIENT_USER' }
  } as User;

  const mockAdminUser = {
    id: 2,
    username: 'adminuser',
    email: 'admin@example.com',
    role: { name: 'ADMIN' }
  } as User;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatisticsController],
      providers: [
        {
          provide: StatisticsService,
          useValue: mockStatisticsService,
        },
        {
          provide: ChartsStatisticsService,
          useValue: mockChartsStatisticsService,
        },
      ],
    }).compile();

    controller = module.get<StatisticsController>(StatisticsController);
    statisticsService = module.get<StatisticsService>(StatisticsService);
    chartsStatisticsService = module.get<ChartsStatisticsService>(ChartsStatisticsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });



  describe('getComparativeStats', () => {
    it('should call getComparativeStats with user id for CLIENT role', async () => {
      const period = 'month';
      const year = 2025;
      const mockComparativeStats = {
        period: 'month',
        data: {
          totalOrders: 5,
          cancelledOrders: 1,
          totalProjects: 3,
          completedProjects: 2,
          lateProjects: 1,
          averageAvis: 4.5,
          totalAvis: 4,
          reclamationRatio: 33.33,
        },
        comparison: {
          previousPeriod: 'last-month',
          change: 10,
          trend: 'up' as const,
        },
      };

      mockStatisticsService.getComparativeStats.mockResolvedValue(mockComparativeStats);

      const result = await controller.getComparativeStats(period, mockUser, year);

      expect(result).toEqual(mockComparativeStats);
      expect(mockStatisticsService.getComparativeStats).toHaveBeenCalledWith(period, mockUser.id, year);
    });

    it('should call getComparativeStats with undefined user id for ADMIN role', async () => {
      const period = 'month';
      const year = 2025;
      const mockComparativeStats = {
        period: 'month',
        data: {
          totalOrders: 10,
          cancelledOrders: 2,
          totalProjects: 5,
          completedProjects: 4,
          lateProjects: 1,
          averageAvis: 4.7,
          totalAvis: 4,
          reclamationRatio: 40,
        },
        comparison: {
          previousPeriod: 'last-month',
          change: 15,
          trend: 'up' as const,
        },
      };

      mockStatisticsService.getComparativeStats.mockResolvedValue(mockComparativeStats);

      const result = await controller.getComparativeStats(period, mockAdminUser, year);

      expect(result).toEqual(mockComparativeStats);
      expect(mockStatisticsService.getComparativeStats).toHaveBeenCalledWith(period, undefined, year);
    });
  });

  describe('getAvailableYears', () => {
    it('should return available years', async () => {
      const mockYears = [2023, 2024, 2025];
      mockStatisticsService.getAvailableYears.mockResolvedValue(mockYears);

      const result = await controller.getAvailableYears();

      expect(result).toEqual(mockYears);
      expect(mockStatisticsService.getAvailableYears).toHaveBeenCalled();
    });

    it('should handle empty years array', async () => {
      const mockYears: number[] = [];
      mockStatisticsService.getAvailableYears.mockResolvedValue(mockYears);

      const result = await controller.getAvailableYears();

      expect(result).toEqual([]);
      expect(mockStatisticsService.getAvailableYears).toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should call searchAllUser if user role starts with CLIENT', async () => {
      const keyword = 'test';
      const query = { keyword };
      const mockResult = { projects: [], devis: [], partners: [] };
      mockStatisticsService.searchAllUser.mockResolvedValue(mockResult);

      const result = await controller.search(query, mockUser);

      expect(result).toEqual(mockResult);
      expect(mockStatisticsService.searchAllUser).toHaveBeenCalledWith(keyword.trim(), mockUser.id);
      expect(mockStatisticsService.searchAll).not.toHaveBeenCalled();
    });

    it('should call searchAll if user role does not start with CLIENT', async () => {
      const keyword = 'test';
      const query = { keyword };
      const mockResult = { projects: [], devis: [], partners: [] };
      mockStatisticsService.searchAll.mockResolvedValue(mockResult);

      const result = await controller.search(query, mockAdminUser);

      expect(result).toEqual(mockResult);
      expect(mockStatisticsService.searchAll).toHaveBeenCalledWith(keyword.trim());
      expect(mockStatisticsService.searchAllUser).not.toHaveBeenCalled();
    });

    it('should handle empty keyword', async () => {
      const query = { keyword: '' };
      const mockResult = { projects: [], devis: [], partners: [] };
      mockStatisticsService.searchAll.mockResolvedValue(mockResult);

      const result = await controller.search(query, mockAdminUser);

      expect(result).toEqual(mockResult);
      expect(mockStatisticsService.searchAll).toHaveBeenCalledWith('');
    });

    it('should handle keyword with whitespace', async () => {
      const query = { keyword: '  test  ' };
      const mockResult = { projects: [], devis: [], partners: [] };
      mockStatisticsService.searchAll.mockResolvedValue(mockResult);

      const result = await controller.search(query, mockAdminUser);

      expect(result).toEqual(mockResult);
      expect(mockStatisticsService.searchAll).toHaveBeenCalledWith('test');
    });
  });

  describe('getChartsStatistics', () => {
    it('should call getChartsStatistics with user id for CLIENT role', async () => {
      const filters: ChartsFilterDto = { year: 2024 };
      const mockChartsStats = {
        reclamations: { series: [1, 2], labels: ['A', 'B'], colors: ['#ff0000', '#00ff00'], total: 3 },
        cahiersDesCharges: { series: [1, 2], labels: ['A', 'B'], colors: ['#ff0000', '#00ff00'], total: 3 },
        devis: { series: [1, 2], labels: ['A', 'B'], colors: ['#ff0000', '#00ff00'], total: 3 },
        projects: { series: [1, 2], labels: ['A', 'B'], colors: ['#ff0000', '#00ff00'], total: 3 },
        avis: { 
          series: [1, 2], 
          labels: ['A', 'B'], 
          colors: ['#ff0000', '#00ff00'], 
          total: 3,
          average: 4.5,
          totalAvis: 3,
          details: []
        },
      };

      mockChartsStatisticsService.getChartsStatistics.mockResolvedValue(mockChartsStats);

      const result = await controller.getChartsStatistics(filters, mockUser);

      expect(result).toEqual(mockChartsStats);
      expect(mockChartsStatisticsService.getChartsStatistics).toHaveBeenCalledWith({
        ...filters,
        userId: mockUser.id,
      });
    });

    it('should call getChartsStatistics without user id for ADMIN role', async () => {
      const filters: ChartsFilterDto = { year: 2024, partnerId: 1 };
      const mockChartsStats = {
        reclamations: { series: [1, 2], labels: ['A', 'B'], colors: ['#ff0000', '#00ff00'], total: 3 },
        cahiersDesCharges: { series: [1, 2], labels: ['A', 'B'], colors: ['#ff0000', '#00ff00'], total: 3 },
        devis: { series: [1, 2], labels: ['A', 'B'], colors: ['#ff0000', '#00ff00'], total: 3 },
        projects: { series: [1, 2], labels: ['A', 'B'], colors: ['#ff0000', '#00ff00'], total: 3 },
        avis: { 
          series: [1, 2], 
          labels: ['A', 'B'], 
          colors: ['#ff0000', '#00ff00'], 
          total: 3,
          average: 4.5,
          totalAvis: 3,
          details: []
        },
      };

      mockChartsStatisticsService.getChartsStatistics.mockResolvedValue(mockChartsStats);

      const result = await controller.getChartsStatistics(filters, mockAdminUser);

      expect(result).toEqual(mockChartsStats);
      expect(mockChartsStatisticsService.getChartsStatistics).toHaveBeenCalledWith(filters);
    });
  });

  describe('getChartFilterOptions', () => {
    it('should call getFilterOptions with user id for CLIENT role', async () => {
      const mockFilterOptions = {
        users: [],
        partners: [],
        years: [2023, 2024],
      };

      mockChartsStatisticsService.getFilterOptions.mockResolvedValue(mockFilterOptions);

      const result = await controller.getChartFilterOptions(undefined, mockUser);

      expect(result).toEqual(mockFilterOptions);
      expect(mockChartsStatisticsService.getFilterOptions).toHaveBeenCalledWith(mockUser.id);
    });

    it('should call getFilterOptions with partnerId for ADMIN role', async () => {
      const partnerId = 1;
      const mockFilterOptions = {
        users: [],
        partners: [{ id: 1, name: 'Partner A' }],
        years: [2023, 2024],
      };

      mockChartsStatisticsService.getFilterOptions.mockResolvedValue(mockFilterOptions);

      const result = await controller.getChartFilterOptions(partnerId, mockAdminUser);

      expect(result).toEqual(mockFilterOptions);
      expect(mockChartsStatisticsService.getFilterOptions).toHaveBeenCalledWith(partnerId);
    });
  });
});