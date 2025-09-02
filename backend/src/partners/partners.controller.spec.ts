import { Test, TestingModule } from '@nestjs/testing';
import { PartnerStatus } from '../project/enum/partner-status.enum';
import { User } from '../users/entities/users.entity';
import { Partner } from './entities/partner.entity';
import { PartnersController } from './partners.controller';
import { PartnersService } from './partners.service';

describe('PartnersController', () => {
  let controller: PartnersController;
  let service: PartnersService;

  const mockPartner: Partner = {
    id: 1,
    name: 'Partner1',
    address: '123 Main St',
    tel: '1234567890',
      partnerStatus: PartnerStatus.ACTIVE, // Assign enum value here
    image: 'image.png',
    createdAt: new Date(),
    updatedAt: new Date(),
    users: [],
  };

  const mockUser: User = {
    id: 1,
    username: 'user1',
    // add other user fields as necessary or use Partial<User>
  } as User;

  const mockPartnersService = {
    findAll: jest.fn().mockResolvedValue([mockPartner]),
    findOne: jest.fn().mockResolvedValue(mockPartner),
    create: jest.fn().mockResolvedValue(mockPartner),
    update: jest.fn().mockResolvedValue(mockPartner),
    remove: jest.fn().mockResolvedValue(undefined),
    getUsersByPartnerId: jest.fn().mockResolvedValue([mockUser]),
    inactivatePartner: jest.fn().mockResolvedValue(mockPartner),
    activatePartner: jest.fn().mockResolvedValue(mockPartner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartnersController],
      providers: [
        {
          provide: PartnersService,
          useValue: mockPartnersService,
        },
      ],
    }).compile();

    controller = module.get<PartnersController>(PartnersController);
    service = module.get<PartnersService>(PartnersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of partners', async () => {
      await expect(controller.findAll()).resolves.toEqual([mockPartner]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single partner by id', async () => {
      await expect(controller.findOne(1)).resolves.toEqual(mockPartner);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create and return a new partner', async () => {
      const partnerDto = { name: 'Partner1', address: '123 Main St', tel: '1234567890' };
      await expect(controller.create(partnerDto)).resolves.toEqual(mockPartner);
      expect(service.create).toHaveBeenCalledWith(partnerDto);
    });
  });

  describe('update', () => {
    it('should update and return a partner', async () => {
      const updateDto = { name: 'Updated Partner' };
      await expect(controller.update(1, updateDto)).resolves.toEqual(mockPartner);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove partner by id', async () => {
      await expect(controller.remove(1)).resolves.toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('getUsersByPartnerId', () => {
    it('should return users associated with a partner', async () => {
      await expect(controller.getUsersByPartnerId(1)).resolves.toEqual([mockUser]);
      expect(service.getUsersByPartnerId).toHaveBeenCalledWith(1);
    });
  });

  describe('inactivatePartner', () => {
    it('should inactivate a partner and users', async () => {
      await expect(controller.inactivatePartner(1)).resolves.toEqual(mockPartner);
      expect(service.inactivatePartner).toHaveBeenCalledWith(1);
    });
  });

  describe('activatePartner', () => {
    it('should activate a partner and users', async () => {
      await expect(controller.activatePartner(1)).resolves.toEqual(mockPartner);
      expect(service.activatePartner).toHaveBeenCalledWith(1);
    });
  });
});
