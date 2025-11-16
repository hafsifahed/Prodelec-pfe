import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/users.entity';
import { ChartsStatisticsController } from './charts-statistics.controller';
import { ChartsStatisticsService } from './charts-statistics.service';
import { ChartsFilterDto } from './dto/charts-filter.dto';

describe('ChartsStatisticsController', () => {
  let controller: ChartsStatisticsController;
  let service: ChartsStatisticsService;

  const mockChartsStatisticsService = {
    getChartsStatistics: jest.fn(),
    getFilterOptions: jest.fn(),
  };

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: {
      id: 1,
      name: 'ADMIN',
      permissions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isSystemRole: false
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const mockClientUser: User = {
    id: 2,
    username: 'clientuser',
    email: 'client@example.com',
    role: {
      id: 2,
      name: 'CLIENT_USER',
      permissions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isSystemRole: false
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const mockChartsStatistics = {
    reclamations: {
      series: [10, 20, 30],
      labels: ['Open', 'In Progress', 'Resolved'],
      colors: ['#ff0000', '#ffff00', '#00ff00'],
      total: 60
    },
    cahiersDesCharges: {
      series: [5, 15, 25],
      labels: ['Draft', 'In Review', 'Approved'],
      colors: ['#ff0000', '#ffff00', '#00ff00'],
      total: 45
    },
    devis: {
      series: [8, 12, 20],
      labels: ['Pending', 'Accepted', 'Refused'],
      colors: ['#ff0000', '#ffff00', '#00ff00'],
      total: 40
    },
    projects: {
      series: [2, 8, 15],
      labels: ['Planning', 'Development', 'Completed'],
      colors: ['#ff0000', '#ffff00', '#00ff00'],
      total: 25
    },
    avis: {
      series: [4, 6, 10],
      labels: ['1 Star', '2 Stars', '3 Stars'],
      colors: ['#ff0000', '#ffff00', '#00ff00'],
      total: 20,
      average: 2.3,
      totalAvis: 20,
      details: [
        { username: 'user1', partnerName: 'Partner A', score: 3 },
        { username: 'user2', partnerName: 'Partner B', score: 2 }
      ]
    }
  };

  const mockFilterOptions = {
    partners: [
      { id: 1, name: 'Partner A' },
      { id: 2, name: 'Partner B' }
    ],
    users: [
      { id: 1, email: 'user1@example.com', username: 'user1' },
      { id: 2, email: 'user2@example.com', username: 'user2' }
    ],
    years: [2023, 2024, 2025]
  };

  // Mock JWT Guard
  const mockJwtAuthGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = mockUser;
      return true;
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChartsStatisticsController],
      providers: [
        {
          provide: ChartsStatisticsService,
          useValue: mockChartsStatisticsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<ChartsStatisticsController>(ChartsStatisticsController);
    service = module.get<ChartsStatisticsService>(ChartsStatisticsService);
    
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getChartsStatistics', () => {
    it('should return charts statistics with filters', async () => {
      // Arrange
      const filters: ChartsFilterDto = {
        partnerId: 1,
        userId: 2,
        year: 2024
      };
      
      mockChartsStatisticsService.getChartsStatistics.mockResolvedValue(mockChartsStatistics);

      // Act
      const result = await controller.getChartsStatistics(filters, mockUser);

      // Assert
      expect(result).toEqual(mockChartsStatistics);
      expect(mockChartsStatisticsService.getChartsStatistics).toHaveBeenCalledWith(filters);
      expect(mockChartsStatisticsService.getChartsStatistics).toHaveBeenCalledTimes(1);
    });

    it('should return charts statistics with empty filters', async () => {
      // Arrange
      const filters: ChartsFilterDto = {};
      
      mockChartsStatisticsService.getChartsStatistics.mockResolvedValue(mockChartsStatistics);

      // Act
      const result = await controller.getChartsStatistics(filters, mockUser);

      // Assert
      expect(result).toEqual(mockChartsStatistics);
      expect(mockChartsStatisticsService.getChartsStatistics).toHaveBeenCalledWith({});
    });

    it('should return charts statistics with partial filters', async () => {
      // Arrange
      const filters: ChartsFilterDto = {
        year: 2024
      };
      
      mockChartsStatisticsService.getChartsStatistics.mockResolvedValue(mockChartsStatistics);

      // Act
      const result = await controller.getChartsStatistics(filters, mockUser);

      // Assert
      expect(result).toEqual(mockChartsStatistics);
      expect(mockChartsStatisticsService.getChartsStatistics).toHaveBeenCalledWith({ year: 2024 });
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const filters: ChartsFilterDto = { partnerId: 1 };
      const error = new Error('Database error');
      
      mockChartsStatisticsService.getChartsStatistics.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.getChartsStatistics(filters, mockUser)).rejects.toThrow('Database error');
    });

    it('should work with different user roles', async () => {
      // Arrange
      const filters: ChartsFilterDto = { year: 2024 };
      mockChartsStatisticsService.getChartsStatistics.mockResolvedValue(mockChartsStatistics);

      // Act
      const result = await controller.getChartsStatistics(filters, mockClientUser);

      // Assert
      expect(result).toEqual(mockChartsStatistics);
      expect(mockChartsStatisticsService.getChartsStatistics).toHaveBeenCalledWith(filters);
    });

    it('should automatically filter by userId for CLIENT users', async () => {
      // Arrange
      const filters: ChartsFilterDto = { year: 2024 };
      mockChartsStatisticsService.getChartsStatistics.mockResolvedValue(mockChartsStatistics);

      // Act
      const result = await controller.getChartsStatistics(filters, mockClientUser);

      // Assert
      expect(result).toEqual(mockChartsStatistics);
      expect(mockChartsStatisticsService.getChartsStatistics).toHaveBeenCalledWith({
        ...filters,
        userId: mockClientUser.id
      });
    });

    it('should not override existing userId for CLIENT users', async () => {
      // Arrange
      const filters: ChartsFilterDto = { year: 2024, userId: 999 }; // Should be overridden
      mockChartsStatisticsService.getChartsStatistics.mockResolvedValue(mockChartsStatistics);

      // Act
      const result = await controller.getChartsStatistics(filters, mockClientUser);

      // Assert
      expect(result).toEqual(mockChartsStatistics);
      expect(mockChartsStatisticsService.getChartsStatistics).toHaveBeenCalledWith({
        ...filters,
        userId: mockClientUser.id // Should override the provided userId
      });
    });
  });

  describe('getFilterOptions', () => {
    it('should return filter options with partnerId', async () => {
      // Arrange
      const partnerId = 1;
      mockChartsStatisticsService.getFilterOptions.mockResolvedValue(mockFilterOptions);

      // Act
      const result = await controller.getFilterOptions(partnerId, mockUser);

      // Assert
      expect(result).toEqual(mockFilterOptions);
      expect(mockChartsStatisticsService.getFilterOptions).toHaveBeenCalledWith(partnerId);
      expect(mockChartsStatisticsService.getFilterOptions).toHaveBeenCalledTimes(1);
    });

    it('should return filter options without partnerId', async () => {
      // Arrange
      mockChartsStatisticsService.getFilterOptions.mockResolvedValue(mockFilterOptions);

      // Act
      const result = await controller.getFilterOptions(undefined, mockUser);

      // Assert
      expect(result).toEqual(mockFilterOptions);
      expect(mockChartsStatisticsService.getFilterOptions).toHaveBeenCalledWith(undefined);
    });

    it('should return filter options with null partnerId', async () => {
      // Arrange
      const partnerId = null;
      mockChartsStatisticsService.getFilterOptions.mockResolvedValue(mockFilterOptions);

      // Act
      const result = await controller.getFilterOptions(partnerId, mockUser);

      // Assert
      expect(result).toEqual(mockFilterOptions);
      expect(mockChartsStatisticsService.getFilterOptions).toHaveBeenCalledWith(null);
    });

    it('should handle service errors in filter options', async () => {
      // Arrange
      const partnerId = 1;
      const error = new Error('Filter options error');
      
      mockChartsStatisticsService.getFilterOptions.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.getFilterOptions(partnerId, mockUser)).rejects.toThrow('Filter options error');
    });



    it('should handle empty filter options', async () => {
      // Arrange
      const emptyFilterOptions = {
        partners: [],
        users: [],
        years: []
      };
      
      mockChartsStatisticsService.getFilterOptions.mockResolvedValue(emptyFilterOptions);

      // Act
      const result = await controller.getFilterOptions(undefined, mockUser);

      // Assert
      expect(result).toEqual(emptyFilterOptions);
      expect(result.partners).toHaveLength(0);
      expect(result.users).toHaveLength(0);
      expect(result.years).toHaveLength(0);
    });

    it('should filter by userId for CLIENT users', async () => {
      // Arrange
      mockChartsStatisticsService.getFilterOptions.mockResolvedValue(mockFilterOptions);

      // Act
      const result = await controller.getFilterOptions(undefined, mockClientUser);

      // Assert
      expect(result).toEqual(mockFilterOptions);
      expect(mockChartsStatisticsService.getFilterOptions).toHaveBeenCalledWith(mockClientUser.id);
    });

    it('should ignore partnerId for CLIENT users', async () => {
      // Arrange
      const partnerId = 999; // Should be ignored for CLIENT users
      mockChartsStatisticsService.getFilterOptions.mockResolvedValue(mockFilterOptions);

      // Act
      const result = await controller.getFilterOptions(partnerId, mockClientUser);

      // Assert
      expect(result).toEqual(mockFilterOptions);
      expect(mockChartsStatisticsService.getFilterOptions).toHaveBeenCalledWith(mockClientUser.id);
    });
  });

  describe('DTO validation', () => {
    it('should accept valid ChartsFilterDto', async () => {
      const validFilters: ChartsFilterDto = {
        partnerId: 1,
        userId: 2,
        year: 2024
      };

      mockChartsStatisticsService.getChartsStatistics.mockResolvedValue(mockChartsStatistics);

      const result = await controller.getChartsStatistics(validFilters, mockUser);

      expect(result).toBeDefined();
      expect(mockChartsStatisticsService.getChartsStatistics).toHaveBeenCalledWith(validFilters);
    });

    it('should handle string numbers in DTO', async () => {
      const filtersWithStrings = {
        partnerId: '1',
        year: '2024'
      } as any;

      mockChartsStatisticsService.getChartsStatistics.mockResolvedValue(mockChartsStatistics);

      const result = await controller.getChartsStatistics(filtersWithStrings, mockUser);

      expect(result).toBeDefined();
      expect(mockChartsStatisticsService.getChartsStatistics).toHaveBeenCalledWith({
        partnerId: '1',
        year: '2024'
      });
    });
  });


});