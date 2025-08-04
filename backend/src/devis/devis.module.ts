// src/devis/devis.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CahierDesCharges } from '../cahier-des-charges/entities/cahier-des-charge.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { WorkflowDiscussionModule } from '../workflow-discussion/workflow-discussion.module';
import { DevisController } from './devis.controller';
import { DevisService } from './devis.service';
import { Devis } from './entities/devi.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Devis, CahierDesCharges]),
   NotificationsModule,forwardRef(() =>WorkflowDiscussionModule)
  ],
  providers: [DevisService],
  controllers: [DevisController],
  exports: [DevisService],
})
export class DevisModule {}


