import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module'; // import AuthModule
import { NotificationsGateway } from './notifications.gateway';

@Module({
  imports: [AuthModule],  // import AuthModule to get JwtModule and JwtService
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
