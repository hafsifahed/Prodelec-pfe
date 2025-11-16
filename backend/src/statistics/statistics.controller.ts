// src/statistics/statistics.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/users.entity';
import { ChartsStatisticsService } from './charts-statistics.service';
import { ChartsFilterDto } from './dto/charts-filter.dto';
import { GlobalStats, PeriodStats } from './dto/global-stats.interface';
import { SearchDto } from './dto/search.dto';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(
    private readonly statsService: StatisticsService,
    private readonly chartsStatsService: ChartsStatisticsService,
  ) {}

  @Get('global')
  async getGlobal(
    @Query('period') period: string = 'month',
    @CurrentUser() user: User,
    @Query('year') year?: number,
    @Query('includeAi') includeAi: boolean = false
  ): Promise<GlobalStats> {
    const roleName = user.role.name.toUpperCase();
    const isClientRole = roleName.startsWith('CLIENT');

    // Les clients ne peuvent pas voir l'analyse IA
    const includeAiAnalysis = includeAi && !isClientRole;

    if (isClientRole) {
      return this.statsService.getGlobalStats(period, user.id, year, includeAiAnalysis);
    } else {
      return this.statsService.getGlobalStats(period, undefined, year, includeAiAnalysis);
    }
  }

  @Get('comparative')
  async getComparativeStats(
    @Query('period') period: string = 'month',
    @CurrentUser() user: User,
    @Query('year') year?: number,
  ): Promise<PeriodStats> {
    const roleName = user.role.name.toUpperCase();
    const isClientRole = roleName.startsWith('CLIENT');

    if (isClientRole) {
      return this.statsService.getComparativeStats(period, user.id, year);
    } else {
      return this.statsService.getComparativeStats(period, undefined, year);
    }
  }

  @Get('years')
  async getAvailableYears(): Promise<number[]> {
    return this.statsService.getAvailableYears();
  }

  @Get('search')
  async search(@Query() query: SearchDto, @CurrentUser() user: User) {
    const keyword = query.keyword?.trim() || '';
    console.log('Mot-clé reçu:', keyword);

    const roleName = user.role.name.toUpperCase();
    const isClientRole = roleName.startsWith('CLIENT');

    if (isClientRole) {
      return this.statsService.searchAllUser(keyword, user.id);
    } else {
      return this.statsService.searchAll(keyword);
    }
  }

  // Nouveaux endpoints pour les graphiques
  @Get('charts')
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

  @Get('charts/filters')
  async getChartFilterOptions(
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