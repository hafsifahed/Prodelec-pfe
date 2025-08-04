import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Devis } from '../devis/entities/devi.entity';
import { User } from '../users/entities/users.entity';
import { WorkflowDiscussionModule } from '../workflow-discussion/workflow-discussion.module';
import { Order } from './entities/order.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order,User,Devis]),
    forwardRef(() => WorkflowDiscussionModule), 
],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
