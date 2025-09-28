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
    // Vous pouvez ajouter une logique de filtrage par rôle ici si nécessaire
    return this.chartsStatsService.getChartsStatistics(filters);
  }

  @Get('filters')
async getFilterOptions(
  @Query('partnerId') partnerId?: number,
  @CurrentUser() user?: User
) {
  return this.chartsStatsService.getFilterOptions(partnerId);
}
}