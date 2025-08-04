import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CahierDesChargesModule } from '../cahier-des-charges/cahier-des-charges.module';
import { CahierDesCharges } from '../cahier-des-charges/entities/cahier-des-charge.entity';
import { DevisModule } from '../devis/devis.module';
import { Devis } from '../devis/entities/devi.entity';
import { Order } from '../order/entities/order.entity';
import { OrderModule } from '../order/order.module';
import { Project } from '../project/entities/project.entity';
import { ProjectModule } from '../project/project.module';
import { User } from '../users/entities/users.entity';
import { UsersModule } from '../users/users.module';
import { WorkflowDiscussion } from './entities/workflow-discussion.entity';
import { WorkflowMessage } from './entities/workflow-message.entity';
import { WorkflowDiscussionController } from './workflow-discussion.controller';
import { WorkflowDiscussionService } from './workflow-discussion.service';
import { WorkflowSocketGateway } from './workflow-socket.gateway';

@Module({
   imports: [
    TypeOrmModule.forFeature([
      WorkflowDiscussion, 
      WorkflowMessage,CahierDesCharges,Devis,Order,Project,User
    ]),
    AuthModule,
    forwardRef(() =>CahierDesChargesModule),
    forwardRef(() =>DevisModule),
    forwardRef(() =>OrderModule),
    forwardRef(() =>ProjectModule),
    forwardRef(() =>UsersModule)
  ],
  controllers: [WorkflowDiscussionController],
  providers: [WorkflowDiscussionService,WorkflowSocketGateway],
  exports: [WorkflowDiscussionService],
  
})
export class WorkflowDiscussionModule {}
