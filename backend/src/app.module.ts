import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AvisModule } from './avis/avis.module';
import { Avis } from './avis/entities/avis.entity';
import { Partner } from './partners/entities/partner.entity';
import { PartnersModule } from './partners/partners.module';
import { Role } from './roles/entities/role.entity';
import { RolesModule } from './roles/roles.module';
import { SeedModule } from './seed/seed.module';
import { UserSession } from './user-session/entities/user-session.entity';
import { UserSessionModule } from './user-session/user-session.module';
import { User } from './users/entities/users.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'your_database',
      entities: [User,Role,UserSession,Partner,Avis],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    RolesModule,
    SeedModule,
    UserSessionModule,
    PartnersModule,
    AvisModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
