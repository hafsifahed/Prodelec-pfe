// src/statistics/statistics.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Avis } from '../avis/entities/avis.entity';
import { Order } from '../order/entities/order.entity';
import { Project } from '../project/entities/project.entity';
import { Reclamation } from '../reclamation/entities/reclamation.entity';
import { UserSession } from '../user-session/entities/user-session.entity';
import { User } from '../users/entities/users.entity';

import { Devis } from '../devis/entities/devi.entity';
import { Partner } from '../partners/entities/partner.entity';
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
      Partner
    ]),
  ],
  providers: [StatisticsService],
  controllers: [StatisticsController],
})
export class StatisticsModule {}
