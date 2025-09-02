import { Test, TestingModule } from '@nestjs/testing';
import { AvisController } from './avis.controller';
import { AvisService } from './avis.service';
import { CreateAvisDto } from './dto/create-avis.dto';
import { UpdateAvisDto } from './dto/update-avis.dto';

describe('AvisController', () => {
  let controller: AvisController;
  let service: AvisService;

  // Mock implementation of AvisService for isolating tests
  const mockAvisService = {
    create: jest.fn(dto => Promise.resolve({ id: 1, ...dto })),
    findAll: jest.fn(() => Promise.resolve([{ id: 1, conformiteExigences: 'Good' }])),
    findOne: jest.fn(id => Promise.resolve({ id, conformiteExigences: 'Good' })),
    update: jest.fn((id, dto) => Promise.resolve({ id, ...dto })),
    remove: jest.fn(id => Promise.resolve()),
    findByUser: jest.fn(userId => Promise.resolve([{ id: 1, user: { id: userId } }])),
    findByPartner: jest.fn(partnerId => Promise.resolve([{ id: 1, user: { partner: { id: partnerId } } }])),
    hasOldAvis: jest.fn(userId => Promise.resolve(true)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvisController],
      providers: [
        {
          provide: AvisService,
          useValue: mockAvisService,
        },
      ],
    }).compile();

    controller = module.get<AvisController>(AvisController);
    service = module.get<AvisService>(AvisService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create and return an avis', async () => {
      const dto: CreateAvisDto = { conformiteExigences: 'Good' };
      await expect(controller.create(dto)).resolves.toEqual({ id: 1, ...dto });
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return an array of avis', async () => {
      await expect(controller.findAll()).resolves.toEqual([{ id: 1, conformiteExigences: 'Good' }]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single avis', async () => {
      await expect(controller.findOne('1')).resolves.toEqual({ id: 1, conformiteExigences: 'Good' });
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update and return the avis', async () => {
      const dto: UpdateAvisDto = { conformiteExigences: 'Updated' };
      await expect(controller.update('1', dto)).resolves.toEqual({ id: 1, ...dto });
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should remove the avis', async () => {
      await expect(controller.remove('1')).resolves.toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('findByUser', () => {
    it('should return avis for a user', async () => {
      await expect(controller.findByUser('2')).resolves.toEqual([{ id: 1, user: { id: 2 } }]);
      expect(service.findByUser).toHaveBeenCalledWith(2);
    });
  });

  describe('findByPartner', () => {
    it('should return avis for a partner', async () => {
      await expect(controller.findByPartner('3')).resolves.toEqual([{ id: 1, user: { partner: { id: 3 } } }]);
      expect(service.findByPartner).toHaveBeenCalledWith(3);
    });
  });

  describe('hasOldAvis', () => {
    it('should return boolean if user has old avis', async () => {
      await expect(controller.hasOldAvis('4')).resolves.toEqual(true);
      expect(service.hasOldAvis).toHaveBeenCalledWith(4);
    });
  });
});
