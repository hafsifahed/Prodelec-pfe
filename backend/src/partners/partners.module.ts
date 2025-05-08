import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/users.entity';
import { Partner } from './entities/partner.entity';
import { PartnersController } from './partners.controller';
import { PartnersService } from './partners.service';

@Module({
  imports: [TypeOrmModule.forFeature([Partner, User])],
  controllers: [PartnersController],
  providers: [PartnersService],
  exports: [PartnersService],

})
export class PartnersModule {}
