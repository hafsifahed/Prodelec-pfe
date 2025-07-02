import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from './entities/setting.entity';
import { SettingController } from './setting.controller';
import { SettingService } from './setting.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Setting]) // <-- Ajoute cette ligne
  ],
  controllers: [SettingController],
  providers: [SettingService],
})
export class SettingModule {}
