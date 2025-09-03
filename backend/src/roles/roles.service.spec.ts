import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { RolesService } from './roles.service';

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

describe('RolesService', () => {
  let service: RolesService;
  let repo: Repository<Role>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getRepositoryToken(Role),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    repo = module.get<Repository<Role>>(getRepositoryToken(Role));

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and save a role', async () => {
      const dto: CreateRoleDto = { name: 'TestRole', permissions: [] };
      const roleEntity = { id: 1, ...dto };
      (repo.create as jest.Mock).mockReturnValue(roleEntity);
      (repo.save as jest.Mock).mockResolvedValue(roleEntity);

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(roleEntity);
      expect(result).toEqual(roleEntity);
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      const roles = [{ id: 1 }, { id: 2 }];
      (repo.find as jest.Mock).mockResolvedValue(roles);

      const result = await service.findAll();

      expect(repo.find).toHaveBeenCalled();
      expect(result).toEqual(roles);
    });
  });

  describe('findOne', () => {
    it('should return the role if found', async () => {
      const role = { id: 1, name: 'Role1' };
      (repo.findOne as jest.Mock).mockResolvedValue(role);

      const result = await service.findOne(1);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(role);
    });

    it('should throw NotFoundException if role not found', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and save the role', async () => {
      const role = { id: 1, name: 'OldName', permissions: [], isSystemRole: false };
      const dto: UpdateRoleDto = { name: 'NewName' };
      (service.findOne as jest.Mock) = jest.fn().mockResolvedValue(role);
      (repo.save as jest.Mock).mockResolvedValue({ ...role, ...dto });

      // Using service.findOne spy to avoid calling the actual method logic twice
      jest.spyOn(service, 'findOne').mockResolvedValue(role as any);

      const result = await service.update(1, dto);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(repo.save).toHaveBeenCalledWith({ ...role, ...dto });
      expect(result).toEqual({ ...role, ...dto });
    });
  });

  describe('remove', () => {
    it('should remove a role if not system role', async () => {
      const role = { id: 1, isSystemRole: false };
      jest.spyOn(service, 'findOne').mockResolvedValue(role as any);
      (repo.remove as jest.Mock).mockResolvedValue(undefined);

      await service.remove(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(repo.remove).toHaveBeenCalledWith(role);
    });

    it('should throw ConflictException if system role', async () => {
      const role = { id: 1, isSystemRole: true };
      jest.spyOn(service, 'findOne').mockResolvedValue(role as any);

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
      expect(repo.remove).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if role not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
      expect(repo.remove).not.toHaveBeenCalled();
    });
  });
});
