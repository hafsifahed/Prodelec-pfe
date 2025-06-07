// src/statistics/statistics.controller.ts
import { Controller, Get } from '@nestjs/common';
import { GlobalStats, StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statsService: StatisticsService) {}

  @Get('global')
  getGlobal(): Promise<GlobalStats> {
    return this.statsService.getGlobalStats();
  }
}
