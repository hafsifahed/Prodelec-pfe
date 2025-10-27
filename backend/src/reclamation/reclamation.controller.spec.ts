import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import * as fs from 'fs';
import { User } from '../users/entities/users.entity';
import { CreateReclamationDto } from './dto/create-reclamation.dto';
import { ProcessReclamationDto } from './dto/process-reclamation.dto';
import { UpdateReclamationDto } from './dto/update-reclamation.dto';
import { Reclamation } from './entities/reclamation.entity';
import { ReclamationStatus } from './enums/reclamation-status.enum';
import { TypeReclamation } from './enums/type-reclamation.enum';
import { ReclamationController } from './reclamation.controller';
import { ReclamationService } from './reclamation.service';

jest.mock('fs');
jest.mock('mime-types');
jest.mock('path');
jest.mock('app-root-path', () => ({
  resolve: jest.fn(() => process.cwd()),
  path: process.cwd(),
}));

jest.mock('os', () => ({
  homedir: jest.fn(() => '/mock/home/dir'),
  platform: jest.fn(() => 'win32'),
  arch: jest.fn(() => 'x64'),
}));

describe('ReclamationController', () => {
  let controller: ReclamationController;
  let service: ReclamationService;

  const mockReclamationService = {
    create: jest.fn(),
    update: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByUser: jest.fn(),
    delete: jest.fn(),
    processReclamation: jest.fn(),
  };

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: { id: 1, name: 'USER' }
  } as User;

  const mockReclamation: Reclamation = {
    id_reclamation: 1,
    description: 'Test reclamation',
    dateDeCreation: new Date(),
    PieceJointe: 'test-file.pdf',
    status: ReclamationStatus.EN_COURS,
    user: mockUser,
    Reponse: null,
    type_de_defaut: TypeReclamation.TECHNIQUE,
    archive: false,
    archiveU: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockFile = {
    originalname: 'test document.pdf',
    buffer: Buffer.from('test file content'),
    filename: 'test-file.pdf',
    path: '/temp/test-file.pdf'
  } as Express.Multer.File;

  const mockResponse = {
    setHeader: jest.fn(),
    sendFile: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReclamationController],
      providers: [
        {
          provide: ReclamationService,
          useValue: mockReclamationService,
        },
      ],
    }).compile();

    controller = module.get<ReclamationController>(ReclamationController);
    service = module.get<ReclamationService>(ReclamationService);

    // Clear all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a reclamation', async () => {
      const createDto: CreateReclamationDto = {
        description: 'Test reclamation',
        type_de_defaut: TypeReclamation.TECHNIQUE,
      };

      mockReclamationService.create.mockResolvedValue(mockReclamation);

      const result = await controller.create(createDto, mockUser);

      expect(result).toEqual(mockReclamation);
      expect(mockReclamationService.create).toHaveBeenCalledWith(createDto, mockUser);
    });

    it('should handle service errors during creation', async () => {
      const createDto: CreateReclamationDto = {
        description: 'Test reclamation',
        type_de_defaut: TypeReclamation.TECHNIQUE,
      };

      const error = new Error('Creation failed');
      mockReclamationService.create.mockRejectedValue(error);

      await expect(controller.create(createDto, mockUser)).rejects.toThrow('Creation failed');
    });
  });

  describe('update', () => {
    it('should update a reclamation', async () => {
      const updateDto: UpdateReclamationDto = {
        description: 'Updated reclamation',
      };

      const updatedReclamation = { ...mockReclamation, ...updateDto };
      mockReclamationService.update.mockResolvedValue(updatedReclamation);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(updatedReclamation);
      expect(mockReclamationService.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should handle invalid ID during update', async () => {
      const updateDto: UpdateReclamationDto = {
        description: 'Updated reclamation',
      };

      const error = new Error('Reclamation not found');
      mockReclamationService.update.mockRejectedValue(error);

      await expect(controller.update('999', updateDto)).rejects.toThrow('Reclamation not found');
    });
  });

  describe('findAll', () => {
    it('should return all reclamations', async () => {
      const reclamations = [mockReclamation, { ...mockReclamation, id_reclamation: 2 }];
      mockReclamationService.findAll.mockResolvedValue(reclamations);

      const result = await controller.findAll();

      expect(result).toEqual(reclamations);
      expect(mockReclamationService.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no reclamations exist', async () => {
      mockReclamationService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a reclamation by id', async () => {
      mockReclamationService.findOne.mockResolvedValue(mockReclamation);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockReclamation);
      expect(mockReclamationService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException for non-existent id', async () => {
      mockReclamationService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUser', () => {
    it('should return reclamations for a user', async () => {
      const reclamations = [mockReclamation];
      mockReclamationService.findByUser.mockResolvedValue(reclamations);

      const result = await controller.findByUser('1');

      expect(result).toEqual(reclamations);
      expect(mockReclamationService.findByUser).toHaveBeenCalledWith(1);
    });

    it('should return empty array for user with no reclamations', async () => {
      mockReclamationService.findByUser.mockResolvedValue([]);

      const result = await controller.findByUser('2');

      expect(result).toEqual([]);
    });
  });

  describe('remove', () => {
    it('should delete a reclamation', async () => {
      mockReclamationService.delete.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockReclamationService.delete).toHaveBeenCalledWith(1);
    });

    it('should handle errors during deletion', async () => {
      const error = new Error('Deletion failed');
      mockReclamationService.delete.mockRejectedValue(error);

      await expect(controller.remove('1')).rejects.toThrow('Deletion failed');
    });
  });

  describe('processReclamation', () => {
    it('should process a reclamation', async () => {
      const processDto: ProcessReclamationDto = {
        reponse: 'This issue has been resolved',
      };

      const processedReclamation = {
        ...mockReclamation,
        status: ReclamationStatus.TRAITE,
        Reponse: processDto.reponse,
      };

      mockReclamationService.processReclamation.mockResolvedValue(processedReclamation);

      const result = await controller.processReclamation('1', processDto);

      expect(result).toEqual(processedReclamation);
      expect(mockReclamationService.processReclamation).toHaveBeenCalledWith(1, processDto.reponse);
    });

    it('should handle processing errors', async () => {
      const processDto: ProcessReclamationDto = {
        reponse: 'Response',
      };

      const error = new Error('Processing failed');
      mockReclamationService.processReclamation.mockRejectedValue(error);

      await expect(controller.processReclamation('1', processDto)).rejects.toThrow('Processing failed');
    });
  });




  describe('edge cases', () => {
    it('should handle numeric string IDs correctly', async () => {
      mockReclamationService.findOne.mockResolvedValue(mockReclamation);

      await controller.findOne('123');

      expect(mockReclamationService.findOne).toHaveBeenCalledWith(123);
    });

    it('should handle very long descriptions in create', async () => {
      const longDescription = 'A'.repeat(1000);
      const createDto: CreateReclamationDto = {
        description: longDescription,
        type_de_defaut: TypeReclamation.AUTRE,
      };

      mockReclamationService.create.mockResolvedValue({
        ...mockReclamation,
        description: longDescription,
      });

      const result = await controller.create(createDto, mockUser);

      expect(result.description).toBe(longDescription);
    });

    it('should handle all reclamation types', async () => {
      const types = Object.values(TypeReclamation);
      
      for (const type of types) {
        const createDto: CreateReclamationDto = {
          description: `Test for ${type}`,
          type_de_defaut: type,
        };

        mockReclamationService.create.mockResolvedValue({
          ...mockReclamation,
          type_de_defaut: type,
        });

        const result = await controller.create(createDto, mockUser);
        expect(result.type_de_defaut).toBe(type);
      }
    });

    it('should handle concurrent file operations', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.mkdirSync as jest.Mock).mockImplementation(() => {});
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {});

      const uploads = Array.from({ length: 5 }, (_, i) =>
        controller.uploadFile(
          { ...mockFile, originalname: `file${i}.pdf` } as Express.Multer.File,
          mockUser
        )
      );

      await Promise.all(uploads);

      expect(fs.mkdirSync).toHaveBeenCalledTimes(5);
      expect(fs.writeFileSync).toHaveBeenCalledTimes(5);
    });
  });
});