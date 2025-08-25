import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DevisService } from '../devis/devis.service';
import { SettingService } from '../setting/setting.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly devisService: DevisService,
    private readonly settingService: SettingService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleInvalidateOldDevis() {
    const settings = await this.settingService.getSettings(1); // Par ex. id = 1
    const expirationMonths = settings.devisExpirationMonths ?? 6;

    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() - expirationMonths);

    try {
      await this.devisService.invalidateOldDevis(expirationDate);
      this.logger.log(`Devis non mis à jour depuis plus de ${expirationMonths} mois invalidés.`);
    } catch (error) {
      this.logger.error('Erreur lors de l’invalidation des devis', error);
    }
  }
}
