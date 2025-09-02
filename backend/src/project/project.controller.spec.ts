import { Test, TestingModule } from '@nestjs/testing';
import { Project } from './entities/project.entity';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

describe('ProjectController', () => {
  let controller: ProjectController;
  let service: ProjectService;

  const mockProject: Project = {
    idproject: 1,
    refClient: 'RC123',
    refProdelec: 'RP456',
    qte: 10,
    dlp: new Date(),
    duree: 30,
    progress: 50,
    archivera: false,
    archiverc: false,
    conceptionResponsible: null,
    conceptionComment: null,
    conceptionDuration: null,
    conceptionStatus: false,
    conceptionprogress: 0,
    startConception: null,
    endConception: null,
    realendConception: null,
    methodeResponsible: null,
    methodeComment: null,
    methodeDuration: null,
    methodeStatus: false,
    methodeprogress: 0,
    startMethode: null,
    endMethode: null,
    realendMethode: null,
    productionResponsible: null,
    productionComment: null,
    productionDuration: null,
    productionStatus: false,
    productionprogress: 0,
    startProduction: null,
    endProduction: null,
    realendProduction: null,
    finalControlResponsible: null,
    finalControlComment: null,
    finalControlDuration: null,
    finalControlStatus: false,
    fcprogress: 0,
    startFc: null,
    endFc: null,
    realendFc: null,
    deliveryResponsible: null,
    deliveryComment: null,
    deliveryDuration: null,
    deliveryStatus: false,
    deliveryprogress: 0,
    startDelivery: null,
    endDelivery: null,
    realendDelivery: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    order: null,
    discussion: null,
    finalControlExist: false,
    conceptionExist: false,
    methodeExist: false,
    productionExist: false,
    deliveryExist: false,
  };

  const mockProjectService = {
    addProject: jest.fn().mockResolvedValue(mockProject),
    updateProject: jest.fn().mockResolvedValue(mockProject),
    findAll: jest.fn().mockResolvedValue([mockProject]),
    findOne: jest.fn().mockResolvedValue(mockProject),
    remove: jest.fn().mockResolvedValue(undefined),
    getByPartner: jest.fn().mockResolvedValue([mockProject]),
    getByUser: jest.fn().mockResolvedValue([mockProject]),
    changeStatusConception: jest.fn().mockResolvedValue(mockProject),
    changeStatusMethode: jest.fn().mockResolvedValue(mockProject),
    changeStatusProduction: jest.fn().mockResolvedValue(mockProject),
    changeStatusFC: jest.fn().mockResolvedValue(mockProject),
    changeStatusDelivery: jest.fn().mockResolvedValue(mockProject),
    setConceptionProgress: jest.fn().mockResolvedValue(mockProject),
    setMethodeProgress: jest.fn().mockResolvedValue(mockProject),
    setProductionProgress: jest.fn().mockResolvedValue(mockProject),
    setFcProgress: jest.fn().mockResolvedValue(mockProject),
    setDeliveryProgress: jest.fn().mockResolvedValue(mockProject),
    computeGlobalProgress: jest.fn().mockResolvedValue(mockProject),
    toggleArchive: jest.fn().mockResolvedValue(mockProject),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [
        {
          provide: ProjectService,
          useValue: mockProjectService,
        },
      ],
    }).compile();

    controller = module.get<ProjectController>(ProjectController);
    service = module.get<ProjectService>(ProjectService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

 /* describe('create', () => {
    it('should create a project', async () => {
      const dto: CreateProjectDto = { refClient: 'RC123' };
      const idOrder = 1;

      await expect(
        controller.create(dto, idOrder, 'user1', 'user2', 'user3', 'user4', 'user5'),
      ).resolves.toEqual(mockProject);
      expect(service.addProject).toHaveBeenCalled();
    });
  });*/

  describe('update', () => {
    it('should update a project', async () => {
      const dto: Partial<Project> = { refClient: 'RC456' };

      await expect(controller.update(1, dto, 'user1', 'user2', 'user3', 'user4', 'user5')).resolves.toEqual(
        mockProject,
      );
      expect(service.updateProject).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all projects', async () => {
      await expect(controller.findAll()).resolves.toEqual([mockProject]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return project by id', async () => {
      await expect(controller.findOne(1)).resolves.toEqual(mockProject);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('remove', () => {
    it('should remove project', async () => {
      await expect(controller.remove(1)).resolves.toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  // You can add more tests for other endpoints similarly
});
