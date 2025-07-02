import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { PatchSettingDto } from './dto/patch-setting.dto';
import { Setting } from './entities/setting.entity';
import { SettingService } from './setting.service';

@Controller('settings')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  async getAllSettings(): Promise<Setting> {
    return this.settingService.getSettings(1);
  }

  @Patch(':id')
  async updateSetting(
    @Param('id') id: string,
    @Body() updateData: PatchSettingDto
  ): Promise<Setting> {
    return this.settingService.updateSetting(parseInt(id), updateData);
  }
}
