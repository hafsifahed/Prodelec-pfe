import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationsService } from '../notifications/notifications.service';
import { Reclamation } from './entities/reclamation.entity';
import { ReclamationController } from './reclamation.controller';
import { ReclamationService } from './reclamation.service';

describe('ReclamationController', () => {
  let controller: ReclamationController;
  let service: ReclamationService;

  const mockReclamationRepo = {
    // mock any methods your service calls on the repository
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    // ...
  };

  const mockNotificationsService = {
    notifyAdmins: jest.fn(),
    // mock other methods as needed
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReclamationController],
      providers: [
        ReclamationService,
        { provide: getRepositoryToken(Reclamation), useValue: mockReclamationRepo },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    controller = module.get<ReclamationController>(ReclamationController);
    service = module.get<ReclamationService>(ReclamationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Add your tests here
});
