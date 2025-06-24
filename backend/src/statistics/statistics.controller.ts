// src/statistics/statistics.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GlobalStats, StatisticsService } from './statistics.service';

@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(private readonly statsService: StatisticsService) {}

  @Get('global')
  getGlobal(): Promise<GlobalStats> {
    return this.statsService.getGlobalStats();
  }
}
