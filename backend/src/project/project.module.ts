import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module';
import { Order } from '../order/entities/order.entity';
import { OrderModule } from '../order/order.module';
import { User } from '../users/entities/users.entity';
import { UsersModule } from '../users/users.module';
import { Project } from './entities/project.entity';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Order, User]),
 NotificationsModule,
 forwardRef(() => OrderModule),
 forwardRef(() => UsersModule),
],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
