// src/cdc/cahier-des-charges.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module';
import { User } from '../users/entities/users.entity';
import { CahierDesChargesController } from './cahier-des-charges.controller';
import { CahierDesChargesService } from './cahier-des-charges.service';
import { CdcFileService } from './cdc-file.service';
import { CahierDesCharges } from './entities/cahier-des-charge.entity';
import { CdcFile } from './entities/cdc-file.entity'; // Importez la nouvelle entité

@Module({
  imports: [
    TypeOrmModule.forFeature([CahierDesCharges, User, CdcFile]), // Ajoutez CdcFile ici
    NotificationsModule
  ],
  providers: [CahierDesChargesService,CdcFileService],
  controllers: [CahierDesChargesController],
  exports: [CahierDesChargesService],
})
export class CahierDesChargesModule {}