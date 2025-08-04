import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module';
import { User } from '../users/entities/users.entity';
import { WorkflowDiscussionModule } from '../workflow-discussion/workflow-discussion.module';
import { CahierDesChargesController } from './cahier-des-charges.controller';
import { CahierDesChargesService } from './cahier-des-charges.service';
import { CdcFileService } from './cdc-file.service';
import { CahierDesCharges } from './entities/cahier-des-charge.entity';
import { CdcFile } from './entities/cdc-file.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CahierDesCharges, User, CdcFile]), 
    NotificationsModule,
    forwardRef(() =>WorkflowDiscussionModule)
  ],
  providers: [CahierDesChargesService,CdcFileService],
  controllers: [CahierDesChargesController],
  exports: [CahierDesChargesService],
})
export class CahierDesChargesModule {}