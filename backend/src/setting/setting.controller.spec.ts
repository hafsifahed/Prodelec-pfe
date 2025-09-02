import { Test, TestingModule } from '@nestjs/testing';
import { PatchSettingDto } from './dto/patch-setting.dto';
import { Setting } from './entities/setting.entity';
import { SettingController } from './setting.controller';
import { SettingService } from './setting.service';

describe('SettingController', () => {
  let controller: SettingController;
  let service: SettingService;

  const mockSetting: Setting = {
    id: 1,
    reclamationTarget: 10,
    reclamationEmails: ['rec@example.com'],
    avisEmails: ['avis@example.com'],
    devisEmails: ['devis@example.com'],
    cahierDesChargesEmails: ['cdc@example.com'],
    globalEmails: ['global@example.com'],
    devisExpirationMonths: 6,
  };

  const mockSettingService = {
    getSettings: jest.fn().mockResolvedValue(mockSetting),
    updateSetting: jest.fn().mockImplementation((id: number, dto: PatchSettingDto) => {
      return Promise.resolve({ ...mockSetting, ...dto });
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingController],
      providers: [
        {
          provide: SettingService,
          useValue: mockSettingService,
        },
      ],
    }).compile();

    controller = module.get<SettingController>(SettingController);
    service = module.get<SettingService>(SettingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllSettings', () => {
    it('should return the setting', async () => {
      await expect(controller.getAllSettings()).resolves.toEqual(mockSetting);
      expect(mockSettingService.getSettings).toHaveBeenCalledWith(1);
    });
  });

  describe('updateSetting', () => {
    it('should update and return the updated setting', async () => {
      const updateDto: PatchSettingDto = {
        reclamationTarget: 15,
        devisExpirationMonths: 12,
      };

      const expectedSetting = { ...mockSetting, ...updateDto };

      await expect(controller.updateSetting('1', updateDto)).resolves.toEqual(expectedSetting);
      expect(mockSettingService.updateSetting).toHaveBeenCalledWith(1, updateDto);
    });
  });
});
