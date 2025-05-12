import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reclamation } from './entities/reclamation.entity';
import { ReclamationController } from './reclamation.controller';
import { ReclamationService } from './reclamation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reclamation])],
  controllers: [ReclamationController],
  providers: [ReclamationService],
  exports: [ReclamationService],
})
export class ReclamationModule {}