// src/cdc/cahier-des-charges.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CahierDesChargesController } from './cahier-des-charges.controller';
import { CahierDesChargesService } from './cahier-des-charges.service';
import { CahierDesCharges } from './entities/cahier-des-charge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CahierDesCharges])],
  providers: [CahierDesChargesService],
  controllers: [CahierDesChargesController],
  exports: [CahierDesChargesService],
})
export class CahierDesChargesModule {}
