import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/users.entity';
import { AvisController } from './avis.controller';
import { AvisService } from './avis.service';
import { Avis } from './entities/avis.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Avis, User])],
  controllers: [AvisController],
  providers: [AvisService],
})
export class AvisModule {}
