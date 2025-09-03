import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../users/entities/users.entity';
import { WorkflowDiscussion, WorkflowPhase } from './entities/workflow-discussion.entity';
import { WorkflowDiscussionController } from './workflow-discussion.controller';
import { WorkflowDiscussionService } from './workflow-discussion.service';

describe('WorkflowDiscussionController', () => {
  let controller: WorkflowDiscussionController;
  let service: WorkflowDiscussionService;

  const mockWorkflowDiscussionService = {
    getAllDiscussions: jest.fn(),
    getDiscussionsByUser: jest.fn(),
    getFullDiscussion: jest.fn(),
    getDiscussion: jest.fn(),
    addMessage: jest.fn(),
    transitionPhase: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkflowDiscussionController],
      providers: [
        {
          provide: WorkflowDiscussionService,
          useValue: mockWorkflowDiscussionService,
        },
      ],
    }).compile();

    controller = module.get<WorkflowDiscussionController>(WorkflowDiscussionController);
    service = module.get<WorkflowDiscussionService>(WorkflowDiscussionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllDiscussions', () => {
    it('should return paginated discussions', async () => {
      const result = { discussions: [], total: 0 };
      mockWorkflowDiscussionService.getAllDiscussions.mockResolvedValue(result);

      await expect(controller.getAllDiscussions(1, 20)).resolves.toEqual(result);
      expect(service.getAllDiscussions).toHaveBeenCalledWith(1, 20);
    });
  });

  describe('getDiscussionsByUser', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should call getDiscussionsByUser when role includes CLIENT', async () => {
      const user = { id: 1, role: { name: 'CLIENT_USER' } } as User;
      const result = { discussions: [], total: 0 };
      mockWorkflowDiscussionService.getDiscussionsByUser.mockResolvedValue(result);

      await expect(controller.getDiscussionsByUser(user, 1, 20)).resolves.toEqual(result);
      expect(service.getDiscussionsByUser).toHaveBeenCalledWith(user.id, 1, 20);
      expect(service.getAllDiscussions).not.toHaveBeenCalled();
    });

    it('should call getAllDiscussions for other roles', async () => {
      const user = { id: 1, role: { name: 'ADMIN' } } as User;
      const result = { discussions: [], total: 0 };
      mockWorkflowDiscussionService.getAllDiscussions.mockResolvedValue(result);

      await expect(controller.getDiscussionsByUser(user, 1, 20)).resolves.toEqual(result);
      expect(service.getAllDiscussions).toHaveBeenCalledWith(1, 20);
      expect(service.getDiscussionsByUser).not.toHaveBeenCalled();
    });
  });

  describe('getFullDiscussion', () => {
    it('should return full discussion details', async () => {
      const discussion = {} as WorkflowDiscussion;
      mockWorkflowDiscussionService.getFullDiscussion.mockResolvedValue(discussion);

      await expect(controller.getFullDiscussion(1)).resolves.toEqual(discussion);
      expect(service.getFullDiscussion).toHaveBeenCalledWith(1);
    });
  });

  describe('getDiscussion', () => {
    it('should return discussion by id', async () => {
      const discussion = {} as WorkflowDiscussion;
      mockWorkflowDiscussionService.getDiscussion.mockResolvedValue(discussion);

      await expect(controller.getDiscussion(1)).resolves.toEqual(discussion);
      expect(service.getDiscussion).toHaveBeenCalledWith(1);
    });
  });

  describe('addMessage', () => {
    it('should add message to discussion', async () => {
      const user = { id: 1 } as User;
      const dto = { content: 'message content' };
      const message = { id: 1, content: 'message content' };
      mockWorkflowDiscussionService.addMessage.mockResolvedValue(message);

      await expect(controller.addMessage(1, dto, user)).resolves.toEqual(message);
      expect(service.addMessage).toHaveBeenCalledWith(1, dto, user);
    });
  });

  describe('transitionPhase', () => {
    it('should transition discussion phase', async () => {
      const dto = { targetPhase: WorkflowPhase.DEVIS, targetEntityId: 1 };
      const discussion = {} as WorkflowDiscussion;
      mockWorkflowDiscussionService.transitionPhase.mockResolvedValue(discussion);

      await expect(controller.transitionPhase(1, dto)).resolves.toEqual(discussion);
      expect(service.transitionPhase).toHaveBeenCalledWith(1, dto);
    });
  });
});
