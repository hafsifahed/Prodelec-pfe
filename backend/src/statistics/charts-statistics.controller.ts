// src/statistics/charts-statistics.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/users.entity';
import { ChartsStatisticsService } from './charts-statistics.service';
import { ChartsFilterDto } from './dto/charts-filter.dto';

@Controller('charts-statistics')
@UseGuards(JwtAuthGuard)
export class ChartsStatisticsController {
  constructor(private readonly chartsStatsService: ChartsStatisticsService) {}

  @Get()
  async getChartsStatistics(
    @Query() filters: ChartsFilterDto,
    @CurrentUser() user: User,
  ) {
    const roleName = user.role.name.toUpperCase();
    const isClientRole = roleName.startsWith('CLIENT');

    // Pour les clients, on filtre automatiquement par leur ID
    if (isClientRole) {
      filters.userId = user.id;
    }

    return this.chartsStatsService.getChartsStatistics(filters);
  }

  @Get('filters')
  async getFilterOptions(
    @Query('partnerId') partnerId?: number,
    @CurrentUser() user?: User
  ) {
    const roleName = user.role.name.toUpperCase();
    const isClientRole = roleName.startsWith('CLIENT');

    // Les clients ne peuvent voir que leurs propres données
    if (isClientRole) {
      return this.chartsStatsService.getFilterOptions(user.id);
    }

    return this.chartsStatsService.getFilterOptions(partnerId);
  }
}