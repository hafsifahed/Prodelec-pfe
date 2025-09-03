import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  // Mock UsersService with Jest methods used by the controller
  const mockUsersService = {
    create: jest.fn(),
    createBy: jest.fn(),
    findMany: jest.fn(),
    findAll: jest.fn(),
    findOneById: jest.fn(),
    getProfile: jest.fn(),
    getNameProfile: jest.fn(),
    changePassword: jest.fn(),
    updateRole: jest.fn(),
    updateAccountStatus: jest.fn(),
    updateUser: jest.fn(),
    searchUsers: jest.fn(),
    setPassword: jest.fn(),
    deleteUser: jest.fn(),
    updateUserFull: jest.fn(),
    getUserAndSessionStats: jest.fn(),
    getClientRoles: jest.fn(),
    getWorkerRoles: jest.fn(),
    findWorkers: jest.fn(),
    findClients: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const dto = { username: 'user1' };
      const createdUser = { id: 1, ...dto };
      mockUsersService.create.mockResolvedValue(createdUser);

      await expect(controller.create(dto as any)).resolves.toEqual(createdUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(dto);
    });
  });

 /* describe('findMany', () => {
    it('should retrieve users matching query', async () => {
      const query = { username: 'user' };
      const users = [{ id: 1, username: 'user' }];
            const id = 2;
      const user = { id, username: 'user2' };
      mockUsersService.findMany.mockResolvedValue(users);

      await expect(controller.findMany(query as any,user as any)).resolves.toEqual(users);
      expect(mockUsersService.findMany).toHaveBeenCalledWith(query);
    });
  });*/

  describe('findOneById', () => {
    it('should retrieve user by id', async () => {
      const id = 1;
      const user = { id, username: 'user1' };
      mockUsersService.findOneById.mockResolvedValue(user);

      await expect(controller.findOneById(id)).resolves.toEqual(user);
      expect(mockUsersService.findOneById).toHaveBeenCalledWith(id);
    });
  });

  describe('updateUser', () => {
    it('should call updateUser on service', async () => {
      const id = 1;
      const dto = { firstName: 'New' };
      const updatedUser = { id, ...dto };
      mockUsersService.updateUser.mockResolvedValue(updatedUser);

      await expect(controller.updateUser(id, dto as any)).resolves.toEqual(updatedUser);
      expect(mockUsersService.updateUser).toHaveBeenCalledWith(id, dto);
    });
  });

  describe('deleteUser', () => {
    it('should call deleteUser on service', async () => {
      const id = 1;
      mockUsersService.deleteUser.mockResolvedValue(undefined);

      await expect(controller.deleteUser(id)).resolves.toBeUndefined();
      expect(mockUsersService.deleteUser).toHaveBeenCalledWith(id);
    });
  });

  // Add other method tests similarly as needed.
});
