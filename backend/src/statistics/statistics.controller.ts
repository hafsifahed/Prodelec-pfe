// src/statistics/statistics.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/users.entity';
import { SearchDto } from './dto/search.dto';
import { GlobalStats, PeriodStats, StatisticsService } from './statistics.service';

@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(private readonly statsService: StatisticsService) {}

@Get('global')
  getGlobal(
    @Query('period') period: string = 'month',
        @CurrentUser() user: User,
    @Query('year') year?: number
  ): Promise<GlobalStats> {
    const roleName = user.role.name.toUpperCase();
    const isClientRole = roleName.startsWith('CLIENT');

    if (isClientRole) {
      return this.statsService.getGlobalStats(period, user.id, year);
    } else {
      return this.statsService.getGlobalStats(period, undefined, year);
    }
  }

 @Get('comparative')
  getComparativeStats(
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
  getAvailableYears(): Promise<number[]> {
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
}