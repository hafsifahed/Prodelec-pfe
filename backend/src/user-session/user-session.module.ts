import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/users.entity';
import { UserSession } from './entities/user-session.entity';
import { UserSessionController } from './user-session.controller';
import { UserSessionService } from './user-session.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserSession,User])],
  controllers: [UserSessionController],
  providers: [UserSessionService],
  exports: [UserSessionService],

})
export class UserSessionModule {}
