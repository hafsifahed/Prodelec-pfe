import { Test, TestingModule } from '@nestjs/testing';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { Action } from './enums/action.enum';
import { Resource } from './enums/resource.enum';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

describe('RolesController', () => {
  let controller: RolesController;
  let service: RolesService;

  // Mock simple du service avec Jest
  const mockRolesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create and return the created Role', async () => {
      const dto: CreateRoleDto = {
        name: 'Test Role',
        permissions: [{ resource: Resource.ROLES, actions: [Action.MANAGE] }],
        isSystemRole: false,
      };
      const role: Role = {
        id: 1,
        name: dto.name,
        permissions: dto.permissions as any,
        isSystemRole: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRolesService.create.mockResolvedValue(role);

      await expect(controller.create(dto)).resolves.toEqual(role);
      expect(mockRolesService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return array of roles', async () => {
      const roles: Role[] = [
        { id: 1, name: 'Admin', permissions: [], isSystemRole: true, createdAt: new Date(), updatedAt: new Date() },
      ];
      mockRolesService.findAll.mockResolvedValue(roles);

      await expect(controller.findAll()).resolves.toEqual(roles);
      expect(mockRolesService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return role by id', async () => {
      const role: Role = {
        id: 1,
        name: 'Admin',
        permissions: [],
        isSystemRole: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRolesService.findOne.mockResolvedValue(role);

      await expect(controller.findOne('1')).resolves.toEqual(role);
      expect(mockRolesService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update and return role', async () => {
      const dto: UpdateRoleDto = {
        name: 'Updated Role',
        permissions: [{ resource: Resource.ROLES, actions: [Action.MANAGE] }],
        isSystemRole: false,
      };
      const updatedRole: Role = {
        id: 1,
        name: dto.name,
        permissions: dto.permissions as any,
        isSystemRole: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRolesService.update.mockResolvedValue(updatedRole);

      await expect(controller.update('1', dto)).resolves.toEqual(updatedRole);
      expect(mockRolesService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      mockRolesService.remove.mockResolvedValue(undefined);

      await expect(controller.remove('1')).resolves.toBeUndefined();
      expect(mockRolesService.remove).toHaveBeenCalledWith(1);
    });
  });
});
