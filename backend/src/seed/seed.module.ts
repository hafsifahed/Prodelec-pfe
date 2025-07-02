// src/seed/seed.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../roles/entities/role.entity';
import { Setting } from '../setting/entities/setting.entity';
import { User } from '../users/entities/users.entity';
import { UsersModule } from '../users/users.module';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role, User,Setting]),UsersModule],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
