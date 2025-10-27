import { NotFoundException } from '@nestjs/common';
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
    getArchiveByUserRole: jest.fn(),
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

  describe('getDevisById', () => {
    it('should return a devis by id', async () => {
      const devis: Devis = { id: 1, numdevis: 'D001', projet: 'Project1' } as Devis;
      mockDevisService.getDevisById.mockResolvedValue(devis);
      await expect(controller.getDevisById(1)).resolves.toEqual(devis);
      expect(mockDevisService.getDevisById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when devis not found', async () => {
      mockDevisService.getDevisById.mockRejectedValue(new NotFoundException());
      await expect(controller.getDevisById(999)).rejects.toThrow(NotFoundException);
    });
  });



  describe('acceptDevis', () => {
    it('should accept a devis', async () => {
      const devis: Devis = { id: 1, numdevis: 'D001', etat: 'Accepté' } as Devis;
      mockDevisService.acceptDevis.mockResolvedValue(devis);
      await expect(controller.acceptDevis(1)).resolves.toEqual(devis);
      expect(mockDevisService.acceptDevis).toHaveBeenCalledWith(1);
    });
  });

  describe('refuseDevis', () => {
    it('should refuse a devis with commentaire', async () => {
      const devis: Devis = { id: 1, numdevis: 'D001', etat: 'Refusé', commentaire: 'Test comment' } as Devis;
      const body = { commentaire: 'Test comment' };
      
      mockDevisService.refuseDevis.mockResolvedValue(devis);
      await expect(controller.refuseDevis(1, body)).resolves.toEqual(devis);
      expect(mockDevisService.refuseDevis).toHaveBeenCalledWith(1, body.commentaire);
    });

  });



  describe('restorer', () => {
    it('should restore a devis', async () => {
      const devis: Devis = { id: 1, archive: false } as Devis;
      mockDevisService.restorer.mockResolvedValue(devis);
      await expect(controller.restorer(1)).resolves.toEqual(devis);
      expect(mockDevisService.restorer).toHaveBeenCalledWith(1);
    });
  });

  describe('archiverU', () => {
    it('should call archiverU for client user', async () => {
      const user = { id: 1, role: { name: 'CLIENT' } } as User;
      const devis: Devis = { id: 1, archiveU: true } as Devis;
      
      mockDevisService.archiverU.mockResolvedValue(devis);
      await expect(controller.archiverU(1, user)).resolves.toEqual(devis);
      expect(mockDevisService.archiverU).toHaveBeenCalledWith(1);
    });

    it('should call archiver for non-client user', async () => {
      const user = { id: 1, role: { name: 'ADMIN' } } as User;
      const devis: Devis = { id: 1, archive: true } as Devis;
      
      mockDevisService.archiver.mockResolvedValue(devis);
      await expect(controller.archiverU(1, user)).resolves.toEqual(devis);
      expect(mockDevisService.archiver).toHaveBeenCalledWith(1);
    });
  });

  describe('restorerU', () => {
    it('should restore user archive for devis', async () => {
      const devis: Devis = { id: 1, archiveU: false } as Devis;
      mockDevisService.restorerU.mockResolvedValue(devis);
      await expect(controller.restorerU(1)).resolves.toEqual(devis);
      expect(mockDevisService.restorerU).toHaveBeenCalledWith(1);
    });
  });

  describe('deleteDevis', () => {
    it('should call deleteDevis', async () => {
      const id = 1;
      mockDevisService.deleteDevis.mockResolvedValue(undefined);
      await expect(controller.deleteDevis(id)).resolves.toBeUndefined();
      expect(mockDevisService.deleteDevis).toHaveBeenCalledWith(id);
    });
  });

  describe('startNegociation', () => {
    it('should start negotiation with commentaire', async () => {
      const devis: Devis = { id: 1, etat: 'Négociation', commentaire: 'Test comment' } as Devis;
      const body = { commentaire: 'Test comment' };
      
      mockDevisService.startNegociation.mockResolvedValue(devis);
      await expect(controller.startNegociation(1, body)).resolves.toEqual(devis);
      expect(mockDevisService.startNegociation).toHaveBeenCalledWith(1, body.commentaire);
    });

    it('should start negotiation without commentaire', async () => {
      const devis: Devis = { id: 1, etat: 'Négociation', commentaire: '' } as Devis;
      const body = {};
      
      mockDevisService.startNegociation.mockResolvedValue(devis);
      await expect(controller.startNegociation(1, body)).resolves.toEqual(devis);
      expect(mockDevisService.startNegociation).toHaveBeenCalledWith(1, '');
    });
  });



  describe('getArchiveForCurrentUser', () => {
    it('should return archived devis for current user', async () => {
      const user = { id: 1 } as User;
      const devisList: Devis[] = [{ id: 1, numdevis: 'D001', archive: true } as Devis];
      
      mockDevisService.getArchiveByUserRole.mockResolvedValue(devisList);
      await expect(controller.getArchiveForCurrentUser(user)).resolves.toEqual(devisList);
      expect(mockDevisService.getArchiveByUserRole).toHaveBeenCalledWith(user);
    });
  });
});