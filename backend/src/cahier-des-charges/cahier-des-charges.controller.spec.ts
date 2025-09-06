import { MailerService } from '@nestjs-modules/mailer';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { CahierDesChargesController } from './cahier-des-charges.controller';
import { CahierDesChargesService } from './cahier-des-charges.service';

const mockMailerService = {
  sendMail: jest.fn(),
};

const mockUsersService = {
  findOneById: jest.fn(id => Promise.resolve({ id, username: 'testuser' })),
};

describe('CahierDesChargesController', () => {
  let controller: CahierDesChargesController;
  let service: CahierDesChargesService;

  const mockService = {
    getAllCahierDesCharges: jest.fn().mockResolvedValue([{ id: 1, titre: 'Sample CDC' }]),
    getCahierDesChargesById: jest.fn(id => Promise.resolve({ id, titre: 'Sample CDC' })),
    saveCahierDesCharges: jest.fn(dto => Promise.resolve({ id: 1, ...dto })),
    updateCahierDesCharges: jest.fn(cdc => Promise.resolve(cdc)),
    deleteCahierDesCharges: jest.fn(id => Promise.resolve({ deleted: true })),
    getCahierDesChargesByUser: jest.fn(user => Promise.resolve([{ id: 1, user }])),
    acceptCahierDesCharges: jest.fn(id => Promise.resolve({ id, etat: 'Accepte' })),
    refuseCahierDesCharges: jest.fn((id, commentaire) => Promise.resolve({ id, commentaire, etat: 'Refuse' })),
    archiver: jest.fn(id => Promise.resolve({ id, archive: true })),
    restorer: jest.fn(id => Promise.resolve({ id, archive: false })),
    archiverU: jest.fn(id => Promise.resolve({ id, archiveU: true })),
    restorerU: jest.fn(id => Promise.resolve({ id, archiveU: false })),
    addFileToCdc: jest.fn((cdcId, filename, username) => Promise.resolve({ cdcId, filename, username })),
    removeFile: jest.fn(fileId => Promise.resolve()),
    markAsIncomplete: jest.fn((id, commentaire) => Promise.resolve({ id, commentaire, etat: 'ACompleter' })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CahierDesChargesController],
      providers: [
        { provide: CahierDesChargesService, useValue: mockService },
        { provide: MailerService, useValue: mockMailerService },
        { provide: UsersService, useValue: mockUsersService },  // Added this provider
      ],
    }).compile();

    controller = module.get<CahierDesChargesController>(CahierDesChargesController);
    service = module.get<CahierDesChargesService>(CahierDesChargesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Add your controller method tests here...
});
