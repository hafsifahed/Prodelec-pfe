import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DevisService } from '../devis/devis.service';
import { Setting } from '../setting/entities/setting.entity';
import { SettingService } from '../setting/setting.service';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  let devisService: jest.Mocked<DevisService>;
  let settingService: jest.Mocked<SettingService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: DevisService,
          useValue: {
            invalidateOldDevis: jest.fn(),
          },
        },
        {
          provide: SettingService,
          useValue: {
            getSettings: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    devisService = module.get(DevisService);
    settingService = module.get(SettingService);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('handleInvalidateOldDevis', () => {
    it('should invalidate old devis with custom expiration (3 months)', async () => {
      settingService.getSettings.mockResolvedValue({ devisExpirationMonths: 3 } as Partial<Setting> as Setting);
      devisService.invalidateOldDevis.mockResolvedValue(undefined);

      await service.handleInvalidateOldDevis();

      expect(settingService.getSettings).toHaveBeenCalledWith(1);
      expect(devisService.invalidateOldDevis).toHaveBeenCalledWith(expect.any(Date));
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        expect.stringContaining('Devis non mis à jour depuis plus de 3 mois invalidés.')
      );
    });

    it('should use default 6 months if devisExpirationMonths is missing', async () => {
      settingService.getSettings.mockResolvedValue({} as Partial<Setting> as Setting);
      devisService.invalidateOldDevis.mockResolvedValue(undefined);

      await service.handleInvalidateOldDevis();

      expect(devisService.invalidateOldDevis).toHaveBeenCalledWith(expect.any(Date));
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        expect.stringContaining('Devis non mis à jour depuis plus de 6 mois invalidés.')
      );
    });

    it('should log error if invalidateOldDevis throws', async () => {
      settingService.getSettings.mockResolvedValue({ devisExpirationMonths: 2 } as Partial<Setting> as Setting);
      devisService.invalidateOldDevis.mockRejectedValue(new Error('DB error'));

      await service.handleInvalidateOldDevis();

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Erreur lors de l’invalidation des devis',
        expect.any(Error)
      );
    });
  });
});
