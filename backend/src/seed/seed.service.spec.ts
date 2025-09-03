import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeedService } from './seed.service';

import { Role as RoleEntity } from '../roles/entities/role.entity';
import { Role as RoleEnum } from '../roles/enums/roles.enum';
import { Setting } from '../setting/entities/setting.entity';
import { User } from '../users/entities/users.entity';
import { AccountStatus } from '../users/enums/account-status.enum';
import { UsersService } from '../users/users.service';

// Create mock repository factory
const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
});

const mockUsersService = {
  create: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

describe('SeedService', () => {
  let service: SeedService;
  let roleRepo: Repository<RoleEntity>;
  let userRepo: Repository<User>;
  let settingRepo: Repository<Setting>;
  let usersService: UsersService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        {
          provide: getRepositoryToken(RoleEntity),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Setting),
          useFactory: mockRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);
    roleRepo = module.get<Repository<RoleEntity>>(getRepositoryToken(RoleEntity));
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    settingRepo = module.get<Repository<Setting>>(getRepositoryToken(Setting));
    usersService = module.get<UsersService>(UsersService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  describe('onApplicationBootstrap', () => {
    it('should call all seeding methods', async () => {
      const seedRolesSpy = jest.spyOn(service, 'seedRoles').mockResolvedValue();
      const seedAdminUserSpy = jest.spyOn(service, 'seedAdminUser').mockResolvedValue();
      const seedProcessUsersSpy = jest.spyOn(service, 'seedProcessUsers').mockResolvedValue();
      const seedDefaultSettingSpy = jest.spyOn(service, 'seedDefaultSetting').mockResolvedValue();

      await service.onApplicationBootstrap();

      expect(seedRolesSpy).toHaveBeenCalled();
      expect(seedAdminUserSpy).toHaveBeenCalled();
      expect(seedProcessUsersSpy).toHaveBeenCalled();
      expect(seedDefaultSettingSpy).toHaveBeenCalled();
    });
  });

  describe('seedRoles', () => {
    it('should create missing roles', async () => {
      // Mock findOne returns null (role does not exist)
      roleRepo.findOne = jest.fn().mockResolvedValue(null);
      roleRepo.create = jest.fn().mockImplementation((dto) => dto);
      roleRepo.save = jest.fn().mockResolvedValue({});
      
      await service.seedRoles();

      expect(roleRepo.findOne).toHaveBeenCalled();
      expect(roleRepo.create).toHaveBeenCalled();
      expect(roleRepo.save).toHaveBeenCalled();
    });

    it('should skip roles that already exist', async () => {
      roleRepo.findOne = jest.fn().mockResolvedValue({ id: 1, name: RoleEnum.ADMIN });
      roleRepo.save = jest.fn();

      await service.seedRoles();

      expect(roleRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('seedAdminUser', () => {
    it('should create admin user if not exists', async () => {
      const email = 'admin@example.com';
      const password = configService.get<string>('ADMIN_PASSWORD');
      
      mockConfigService.get.mockImplementation((key: string, defaultValue: any) => {
        if (key === 'ADMIN_EMAIL') return email;
        if (key === 'ADMIN_PASSWORD') return password;
        return defaultValue;
      });

      userRepo.findOne = jest.fn().mockResolvedValue(null);
      roleRepo.findOne = jest.fn().mockResolvedValue({ id: 1, name: RoleEnum.ADMIN });
      usersService.create = jest.fn().mockResolvedValue({});
      userRepo.update = jest.fn().mockResolvedValue({});

      await service.seedAdminUser();

      expect(userRepo.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(roleRepo.findOne).toHaveBeenCalledWith({ where: { name: RoleEnum.ADMIN } });
      expect(usersService.create).toHaveBeenCalled();
      expect(userRepo.update).toHaveBeenCalledWith({ email }, { accountStatus: AccountStatus.ACTIVE });
    });

    it('should do nothing if admin user exists', async () => {
      userRepo.findOne = jest.fn().mockResolvedValue({ email: 'admin@example.com' });

      await service.seedAdminUser();

      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('should throw if admin role missing', async () => {
      userRepo.findOne = jest.fn().mockResolvedValue(null);
      roleRepo.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.seedAdminUser()).rejects.toThrow('Admin role not found');
    });
  });

  describe('seedProcessUsers', () => {
    it('should create process users if not exists', async () => {
      userRepo.findOne = jest.fn().mockResolvedValue(null);
      roleRepo.findOne = jest.fn().mockResolvedValue({ id: 1 });
      usersService.create = jest.fn().mockResolvedValue({});
      userRepo.update = jest.fn().mockResolvedValue({});

      await service.seedProcessUsers();

      expect(usersService.create).toHaveBeenCalled();
      expect(userRepo.update).toHaveBeenCalled();
    });

    it('should skip users if email already exists', async () => {
      userRepo.findOne = jest.fn().mockResolvedValue({ email: 'dummy@example.com' });

      await service.seedProcessUsers();

      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('should warn and skip if role not found', async () => {
      userRepo.findOne = jest.fn().mockResolvedValue(null);
      roleRepo.findOne = jest.fn().mockResolvedValue(null);
      const loggerWarnSpy = jest.spyOn(service['logger'], 'warn');

      await service.seedProcessUsers();

      expect(loggerWarnSpy).toHaveBeenCalled();
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('seedDefaultSetting', () => {
    it('should create default setting if none exists', async () => {
      settingRepo.findOne = jest.fn().mockResolvedValue(null);
      settingRepo.create = jest.fn().mockReturnValue({ reclamationTarget: 3 });
      settingRepo.save = jest.fn().mockResolvedValue({});

      await service.seedDefaultSetting();

      expect(settingRepo.create).toHaveBeenCalledWith({ reclamationTarget: 3 });
      expect(settingRepo.save).toHaveBeenCalled();
    });

    it('should not create if setting exists', async () => {
      settingRepo.findOne = jest.fn().mockResolvedValue({ id: 1 });

      await service.seedDefaultSetting();

      expect(settingRepo.create).not.toHaveBeenCalled();
      expect(settingRepo.save).not.toHaveBeenCalled();
    });
  });
});
