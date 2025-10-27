import { MailerService } from '@nestjs-modules/mailer';
import { Test, TestingModule } from '@nestjs/testing';
import { join } from 'path';
import { UsersService } from '../users/users.service';
import { CahierDesChargesController } from './cahier-des-charges.controller';
import { CahierDesChargesService } from './cahier-des-charges.service';

describe('CahierDesChargesController', () => {
  let controller: CahierDesChargesController;
  let service: CahierDesChargesService;
  let mailerService: MailerService;

  // Mock static BASE_DIRECTORY property
  beforeAll(() => {
    (CahierDesChargesController as any).BASE_DIRECTORY = join(
      process.env.HOME || process.env.USERPROFILE || '',
      'Downloads',
      'uploads',
    );
  });

  const mockMailerService = { 
    sendMail: jest.fn().mockResolvedValue(true) 
  };

  const mockUsersService = {
    findOneById: jest.fn(id => Promise.resolve({ id, username: 'testuser' })),
  };

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
    getArchiveByUserRole: jest.fn(user => Promise.resolve([])),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CahierDesChargesController],
      providers: [
        { provide: CahierDesChargesService, useValue: mockService },
        { provide: MailerService, useValue: mockMailerService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<CahierDesChargesController>(CahierDesChargesController);
    service = module.get<CahierDesChargesService>(CahierDesChargesService);
    mailerService = module.get<MailerService>(MailerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should return all CDCs', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([{ id: 1, titre: 'Sample CDC' }]);
    expect(mockService.getAllCahierDesCharges).toBeCalled();
  });

  it('findOne should return CDC by id', async () => {
    const id = 1;
    const result = await controller.findOne(id);
    expect(result).toEqual({ id, titre: 'Sample CDC' });
    expect(mockService.getCahierDesChargesById).toBeCalledWith(id);
  });

  it('create should create a CDC', async () => {
    const dto = { titre: 'New CDC' };
    const result = await controller.create(dto as any);
    expect(result.id).toBe(1);
    expect(mockService.saveCahierDesCharges).toBeCalledWith(dto);
  });

  it('update should update a CDC', async () => {
    const cdc = { id: 1, titre: 'Updated CDC' };
    const result = await controller.update(cdc as any);
    expect(result).toEqual(cdc);
    expect(mockService.updateCahierDesCharges).toBeCalledWith(cdc);
  });

  it('delete should delete a CDC', async () => {
    const id = 1;
    const result = await controller.delete(id);
    expect(result).toEqual({ deleted: true });
    expect(mockService.deleteCahierDesCharges).toHaveBeenCalledWith(id);
  });

  it('findByUser should find CDCs by user', async () => {
    const userId = 1;
    const result = await controller.findByUser(userId);
    expect(result).toEqual([{ id: 1, user: { id: 1, username: 'testuser' } }]);
    expect(mockUsersService.findOneById).toBeCalledWith(userId);
    expect(mockService.getCahierDesChargesByUser).toBeCalled();
  });

  it('accept should accept CDC', async () => {
    const id = 1;
    const result = await controller.accept(id);
    expect(result).toEqual({ id, etat: 'Accepte' });
    expect(mockService.acceptCahierDesCharges).toBeCalledWith(id);
  });

  it('refuse should refuse CDC', async () => {
    const id = 1;
    const commentaire = 'Invalid';
    const result = await controller.refuse(id, commentaire);
    expect(result).toEqual({ id, commentaire, etat: 'Refuse' });
    expect(mockService.refuseCahierDesCharges).toBeCalledWith(id, commentaire);
  });

  it('archiver should archive CDC user role CLIENT calls archiverU', async () => {
    const id = 1;
    const user = { id: 1, role: { name: 'CLIENT_USER' } } as any;
    mockService.archiverU.mockResolvedValue({ id, archiveU: true });
    const result = await controller.archiver(id, user);
    expect(result).toEqual({ id, archiveU: true });
    expect(mockService.archiverU).toBeCalledWith(id);
  });

  it('archiver should archive CDC user role other calls archiver', async () => {
    const id = 1;
    const user = { id: 1, role: { name: 'ADMIN' } } as any;
    mockService.archiver.mockResolvedValue({ id, archive: true });
    const result = await controller.archiver(id, user);
    expect(result).toEqual({ id, archive: true });
    expect(mockService.archiver).toBeCalledWith(id);
  });

  it('restorer should restore CDC', async () => {
    const id = 1;
    const result = await controller.restorer(id);
    expect(result).toEqual({ id, archive: false });
    expect(mockService.restorer).toBeCalledWith(id);
  });

  it('archiverU should archive CDC user flag', async () => {
    const id = 1;
    const user = { id: 1, role: { name: 'CLIENT_USER' } } as any;
    mockService.archiverU.mockResolvedValue({ id, archiveU: true });
    const result = await controller.archiverU(id, user);
    expect(result).toEqual({ id, archiveU: true });
    expect(mockService.archiverU).toBeCalledWith(id);
  });

  it('restorerU should restore CDC user flag', async () => {
    const id = 1;
    const result = await controller.restorerU(id);
    expect(result).toEqual({ id, archiveU: false });
    expect(mockService.restorerU).toBeCalledWith(id);
  });

  it('deleteFile should delete file', async () => {
    const fileId = 123;
    const result = await controller.deleteFile(fileId);
    expect(result).toEqual({ message: 'Fichier supprimé avec succès' });
    expect(mockService.removeFile).toBeCalledWith(fileId);
  });

  it('markAsIncomplete should mark CDC incomplete', async () => {
    const id = 1;
    const commentaire = 'Needs changes';
    const result = await controller.markAsIncomplete(id, commentaire);
    expect(result).toEqual({ id, commentaire, etat: 'ACompleter' });
    expect(mockService.markAsIncomplete).toBeCalledWith(id, commentaire);
  });

  describe('sendEmail', () => {
    it('should send emails to recipients with formatted HTML template', async () => {
      const emailRequest = {
        to: ['recipient1@example.com', 'recipient2@example.com'],
        subject: 'Test Subject',
        text: '<p>Test Email</p>',
      };

      await controller.sendEmail(emailRequest);

      expect(mockMailerService.sendMail).toHaveBeenCalledTimes(emailRequest.to.length);
      
      // Check first call
      expect(mockMailerService.sendMail).toHaveBeenNthCalledWith(1, {
        to: 'recipient1@example.com',
        from: 'hafsifahed98@gmail.com',
        subject: 'Test Subject',
        html: expect.stringContaining('Test Email'),
      });

      // Check second call  
      expect(mockMailerService.sendMail).toHaveBeenNthCalledWith(2, {
        to: 'recipient2@example.com',
        from: 'hafsifahed98@gmail.com',
        subject: 'Test Subject',
        html: expect.stringContaining('Test Email'),
      });
    });

    it('should throw BadRequestException if to field is invalid', async () => {
      const emailRequest = {
        to: null,
        subject: 'Test Subject',
        text: '<p>Test Email</p>',
      };

      await expect(controller.sendEmail(emailRequest as any)).rejects.toThrow('Le champ "to" doit être un tableau d\'emails');
    });
  });

  describe('getArchiveForCurrentUser', () => {
    it('should return archive for current user', async () => {
      const user = { id: 1 } as any;
      const expectedResult = [{ id: 1, archived: true }];
      mockService.getArchiveByUserRole.mockResolvedValue(expectedResult);

      const result = await controller.getArchiveForCurrentUser(user);

      expect(result).toEqual(expectedResult);
      expect(mockService.getArchiveByUserRole).toHaveBeenCalledWith(user);
    });
  });
});