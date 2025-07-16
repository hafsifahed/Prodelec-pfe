// src/devis/devis.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CahierDesCharges } from '../cahier-des-charges/entities/cahier-des-charge.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { DevisController } from './devis.controller';
import { DevisService } from './devis.service';
import { Devis } from './entities/devi.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Devis, CahierDesCharges]),
   NotificationsModule,
  ],
  providers: [DevisService],
  controllers: [DevisController],
  exports: [DevisService],
})
export class DevisModule {}


