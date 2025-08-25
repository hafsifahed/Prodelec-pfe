import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatchSettingDto } from './dto/patch-setting.dto';
import { Setting } from './entities/setting.entity';

@Injectable()
export class SettingService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
  ) {}

  async updateSetting(id: number, updateData: PatchSettingDto): Promise<Setting> {
    const setting = await this.settingRepository.findOne({ where: { id } });
    console.log(setting)
    if (!setting) {
      throw new NotFoundException(`Setting with ID ${id} not found`);
    }

    // Applique les modifications partielles
    Object.assign(setting, updateData);
    
    return this.settingRepository.save(setting);
  }

  async getSettings(id:number): Promise<Setting> {
    return this.settingRepository.findOne({ where: { id } });
  }
}
