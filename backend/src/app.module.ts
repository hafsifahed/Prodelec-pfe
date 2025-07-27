import { MailerModule } from '@nestjs-modules/mailer';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

import { AvisModule } from './avis/avis.module';
import { CahierDesChargesModule } from './cahier-des-charges/cahier-des-charges.module';
import { DevisModule } from './devis/devis.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PartnersModule } from './partners/partners.module';
import { ReclamationModule } from './reclamation/reclamation.module';
import { RolesModule } from './roles/roles.module';
import { SeedModule } from './seed/seed.module';
import { UserSessionModule } from './user-session/user-session.module';
import { UsersModule } from './users/users.module';

import { Avis } from './avis/entities/avis.entity';
import { Partner } from './partners/entities/partner.entity';
import { Reclamation } from './reclamation/entities/reclamation.entity';
import { Role } from './roles/entities/role.entity';
import { UserSession } from './user-session/entities/user-session.entity';
import { User } from './users/entities/users.entity';

import { CahierDesCharges } from './cahier-des-charges/entities/cahier-des-charge.entity';
import { CdcFile } from './cahier-des-charges/entities/cdc-file.entity';
import { Devis } from './devis/entities/devi.entity';
import { Notification } from './notifications/notification.entity';
import { NotificationsGateway } from './notifications/notifications.gateway';
import { Order } from './order/entities/order.entity';
import { OrderModule } from './order/order.module';
import { Project } from './project/entities/project.entity';
import { ProjectModule } from './project/project.module';
import { Setting } from './setting/entities/setting.entity';
import { SettingModule } from './setting/setting.module';
import { StatisticsModule } from './statistics/statistics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // ou autre chemin vers ton fichier env
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'your_database',
      entities: [
        User,
        Role,
        UserSession,
        Partner,
        Avis,
        Reclamation,
        Devis,
        CahierDesCharges,
        CdcFile,
        Order,
        Project,
        Notification,
        Setting
      ],
      synchronize: true, // à désactiver en prod !
      //logging: true,
        logger: 'advanced-console',

    }),

    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT, 10) || 587,
        secure: false, // true si port 465
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
        from: `"No Reply" <${process.env.MAIL_FROM || 'hafsifahed06@gmail.com'}>`,
      },
    }),

    UsersModule,
    AuthModule,
    RolesModule,
    SeedModule,
    UserSessionModule,
    PartnersModule,
    AvisModule,
     forwardRef(() => NotificationsModule),
    ReclamationModule,
    DevisModule,
    CahierDesChargesModule,
    ProjectModule,
    OrderModule,
    StatisticsModule,
    SettingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Auth global guard
    },
    NotificationsGateway,
  ],
})
export class AppModule {}
