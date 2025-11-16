// src/statistics/statistics.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Avis } from '../avis/entities/avis.entity';
import { Order } from '../order/entities/order.entity';
import { Project } from '../project/entities/project.entity';
import { Reclamation } from '../reclamation/entities/reclamation.entity';
import { UserSession } from '../user-session/entities/user-session.entity';
import { User } from '../users/entities/users.entity';

import { CahierDesCharges } from '../cahier-des-charges/entities/cahier-des-charge.entity';
import { Devis } from '../devis/entities/devi.entity';
import { Partner } from '../partners/entities/partner.entity';
import { AiAnalysisService } from './ai-analysis.service';
import { ChartsStatisticsController } from './charts-statistics.controller';
import { ChartsStatisticsService } from './charts-statistics.service';
import { GeminiService } from './gemini.service';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      Project,
      Reclamation,
      Avis,
      UserSession,
      User,
      Devis,
      Partner,
      CahierDesCharges
    ]),
  ],
  providers: [StatisticsService,ChartsStatisticsService,AiAnalysisService,GeminiService],
  controllers: [StatisticsController,ChartsStatisticsController],
  exports: [
    StatisticsService,
    ChartsStatisticsService,
  ],
})
export class StatisticsModule {}
