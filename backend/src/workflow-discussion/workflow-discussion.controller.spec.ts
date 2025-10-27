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
    markMessagesAsRead: jest.fn(),
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllDiscussions', () => {
    it('should return paginated discussions', async () => {
      const result = { discussions: [], total: 0 };
      mockWorkflowDiscussionService.getAllDiscussions.mockResolvedValue(result);

      const user = { id: 1 } as User;
      await expect(controller.getAllDiscussions(user, 1, 20)).resolves.toEqual(result);
      expect(service.getAllDiscussions).toHaveBeenCalledWith(1, 20, user.id, undefined);
    });

    it('should return paginated discussions with search', async () => {
      const result = { discussions: [], total: 0 };
      mockWorkflowDiscussionService.getAllDiscussions.mockResolvedValue(result);

      const user = { id: 1 } as User;
      await expect(controller.getAllDiscussions(user, 1, 20, 'test')).resolves.toEqual(result);
      expect(service.getAllDiscussions).toHaveBeenCalledWith(1, 20, user.id, 'test');
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
      expect(service.getDiscussionsByUser).toHaveBeenCalledWith(user.id, 1, 20, undefined);
      expect(service.getAllDiscussions).not.toHaveBeenCalled();
    });

    it('should call getAllDiscussions for other roles', async () => {
      const user = { id: 1, role: { name: 'ADMIN' } } as User;
      const result = { discussions: [], total: 0 };
      mockWorkflowDiscussionService.getAllDiscussions.mockResolvedValue(result);

      await expect(controller.getDiscussionsByUser(user, 1, 20)).resolves.toEqual(result);
      expect(service.getAllDiscussions).toHaveBeenCalledWith(1, 20, user.id, undefined);
      expect(service.getDiscussionsByUser).not.toHaveBeenCalled();
    });

    it('should handle search parameter for CLIENT role', async () => {
      const user = { id: 1, role: { name: 'CLIENT_USER' } } as User;
      const result = { discussions: [], total: 0 };
      mockWorkflowDiscussionService.getDiscussionsByUser.mockResolvedValue(result);

      await expect(controller.getDiscussionsByUser(user, 1, 20, 'project')).resolves.toEqual(result);
      expect(service.getDiscussionsByUser).toHaveBeenCalledWith(user.id, 1, 20, 'project');
    });

    it('should handle search parameter for non-CLIENT role', async () => {
      const user = { id: 1, role: { name: 'ADMIN' } } as User;
      const result = { discussions: [], total: 0 };
      mockWorkflowDiscussionService.getAllDiscussions.mockResolvedValue(result);

      await expect(controller.getDiscussionsByUser(user, 1, 20, 'project')).resolves.toEqual(result);
      expect(service.getAllDiscussions).toHaveBeenCalledWith(1, 20, user.id, 'project');
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
    it('should return discussion by id with user id', async () => {
      const discussion = {} as WorkflowDiscussion;
      mockWorkflowDiscussionService.getDiscussion.mockResolvedValue(discussion);

      const user = { id: 1 } as User;
      await expect(controller.getDiscussion(1, user)).resolves.toEqual(discussion);
      expect(service.getDiscussion).toHaveBeenCalledWith(1, user.id);
    });
  });

  describe('markAsRead', () => {
    it('should mark messages as read', async () => {
      mockWorkflowDiscussionService.markMessagesAsRead.mockResolvedValue(undefined);

      const user = { id: 1 } as User;
      await expect(controller.markAsRead(1, user)).resolves.toEqual({ success: true });
      expect(service.markMessagesAsRead).toHaveBeenCalledWith(1, user.id);
    });
  });

  describe('addMessage', () => {
    it('should add message to discussion', async () => {
      const user = { id: 1 } as User;
      const dto = { content: 'message content' } as any;
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