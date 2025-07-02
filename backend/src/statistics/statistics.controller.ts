// src/statistics/statistics.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchDto } from './dto/search.dto';
import { GlobalStats, StatisticsService } from './statistics.service';

@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(private readonly statsService: StatisticsService,
  ) {}

  @Get('global')
  getGlobal(): Promise<GlobalStats> {
    return this.statsService.getGlobalStats();
  }

   @Get('search')
  async search(@Query() query: SearchDto) {
    const keyword = query.keyword?.trim() || 'de';
  console.log('Mot-clé reçu:', keyword);
    return this.statsService.searchAll(keyword);
  }
}
