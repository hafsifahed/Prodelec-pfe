// src/statistics/statistics.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/users.entity';
import { SearchDto } from './dto/search.dto';
import { GlobalStats, StatisticsService } from './statistics.service';

@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(private readonly statsService: StatisticsService,
  ) {}

  @Get('global')
getGlobal(@CurrentUser() user: User): Promise<GlobalStats> {
  const roleName = user.role.name.toUpperCase();
  const isClientRole = roleName.startsWith('CLIENT');

  if (isClientRole) {
    // Statistiques filtrées pour l'utilisateur client
    return this.statsService.getGlobalStatsUser(user.id);
  } else {
    // Statistiques globales pour admin ou autres rôles
    return this.statsService.getGlobalStats();
  }
}

@Get('search')
async search(@Query() query: SearchDto, @CurrentUser() user: User) {
  const keyword = query.keyword?.trim() || '';
  console.log('Mot-clé reçu:', keyword);

  const roleName = user.role.name.toUpperCase();
  const isClientRole = roleName.startsWith('CLIENT');

  if (isClientRole) {
    // Recherche limitée à l'utilisateur client
    return this.statsService.searchAllUser(keyword, user.id);
  } else {
    // Recherche globale pour admin ou autres rôles
    return this.statsService.searchAll(keyword);
  }
}

}
