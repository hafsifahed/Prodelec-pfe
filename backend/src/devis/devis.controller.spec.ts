import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../users/entities/users.entity';
import { DevisController } from './devis.controller';
import { DevisService } from './devis.service';
import { Devis } from './entities/devi.entity';

describe('DevisController', () => {
  let controller: DevisController;
  let service: DevisService;

  const mockDevisService = {
    findAll: jest.fn(),
    findByUser: jest.fn(),
    findAcceptedByCurrentUser: jest.fn(),
    getDevisById: jest.fn(),
    saveDevis: jest.fn(),
    acceptDevis: jest.fn(),
    refuseDevis: jest.fn(),
    archiver: jest.fn(),
    restorer: jest.fn(),
    archiverU: jest.fn(),
    restorerU: jest.fn(),
    deleteDevis: jest.fn(),
    startNegociation: jest.fn(),
    updatePieceJointe: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevisController],
      providers: [{ provide: DevisService, useValue: mockDevisService }],
    }).compile();

    controller = module.get<DevisController>(DevisController);
    service = module.get<DevisService>(DevisService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllDevis', () => {
    it('should return an array of devis', async () => {
      const devisList: Devis[] = [{ id: 1, numdevis: 'D001', projet: 'Project1', etat: 'En attente' } as Devis];
      mockDevisService.findAll.mockResolvedValue(devisList);
      await expect(controller.getAllDevis()).resolves.toEqual(devisList);
      expect(mockDevisService.findAll).toHaveBeenCalled();
    });
  });

  describe('getDevisByUser', () => {
    it('should return devis for user', async () => {
      const userId = 1;
      const devisList: Devis[] = [{ id: 2, numdevis: 'D002', projet: 'Project2', etat: 'Accepté' } as Devis];
      mockDevisService.findByUser.mockResolvedValue(devisList);
      await expect(controller.getDevisByUser(userId)).resolves.toEqual(devisList);
      expect(mockDevisService.findByUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('getAcceptedDevisForCurrentUser', () => {
    it('should return accepted devis for current user', async () => {
      const user = { id: 1 } as User;
      const devisList: Devis[] = [{ id: 3, numdevis: 'D003', projet: 'Project3' } as Devis];
      mockDevisService.findAcceptedByCurrentUser.mockResolvedValue(devisList);
      await expect(controller.getAcceptedDevisForCurrentUser(user)).resolves.toEqual(devisList);
      expect(mockDevisService.findAcceptedByCurrentUser).toHaveBeenCalledWith(user);
    });
  });

 /* describe('saveDevis', () => {
    it('should save and return devis', async () => {
      const cdcId = 1;
      const body = { pieceJointe: 'file.pdf', numdevis: 'D004' };
      const savedDevis = { id: 4, ...body } as Devis;
      mockDevisService.saveDevis.mockResolvedValue(savedDevis);
      await expect(controller.saveDevis(cdcId, body)).resolves.toEqual(savedDevis);
      expect(mockDevisService.saveDevis).toHaveBeenCalledWith(cdcId, body.pieceJointe, body.numdevis);
    });

    it('should throw BadRequestException if pieceJointe is missing', async () => {
      const cdcId = 1;
      const body = { numdevis: 'D005' };
      await expect(controller.saveDevis(cdcId, body as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if numdevis is missing', async () => {
      const cdcId = 1;
      const body = { pieceJointe: 'file.pdf' };
      await expect(controller.saveDevis(cdcId, body as any)).rejects.toThrow(BadRequestException);
    });
  });
*/
  describe('deleteDevis', () => {
    it('should call deleteDevis', async () => {
      const id = 1;
      mockDevisService.deleteDevis.mockResolvedValue(undefined);
      await expect(controller.deleteDevis(id)).resolves.toBeUndefined();
      expect(mockDevisService.deleteDevis).toHaveBeenCalledWith(id);
    });
  });

  // Add tests for other controller methods as needed
});
