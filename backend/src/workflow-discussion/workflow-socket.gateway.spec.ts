import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'socket.io';
import { User } from '../users/entities/users.entity';
import { WorkflowDiscussionService } from './workflow-discussion.service';
import { WorkflowSocketGateway } from './workflow-socket.gateway';

describe('WorkflowSocketGateway', () => {
  let gateway: WorkflowSocketGateway;
  let server: Server;

  const mockWorkflowDiscussionService = {
    validateParticipant: jest.fn(),
    addMessage: jest.fn(),
  };

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  };

  const mockUserPayload = {
    sub: 1,
    username: 'testuser',
    email: 'test@example.com',
  };

  const mockUser: User = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    image: 'profile.jpg',
    role: { id: 1, name: 'USER' }
  } as User;

  const mockMessage = {
    id: 1,
    content: 'Test message',
    createdAt: new Date(),
    type: 'USER',
    phase: 'DISCUSSION',
    author: mockUser,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowSocketGateway,
        { provide: WorkflowDiscussionService, useValue: mockWorkflowDiscussionService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    gateway = module.get<WorkflowSocketGateway>(WorkflowSocketGateway);
    gateway.server = mockServer as any;
    
    // Reset rooms for each test
    (gateway as any).rooms = new Map();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should successfully connect client with valid token and discussionId', async () => {
      const mockClient = {
        handshake: {
          auth: { token: 'valid-token' },
          query: { discussionId: '123' }
        },
        data: {user: mockUser},
        join: jest.fn(),
        disconnect: jest.fn(),
        id: 'client-id-1',
      };

      mockJwtService.verify.mockReturnValue(mockUserPayload);
      mockConfigService.get.mockReturnValue('jwt-secret');
      mockWorkflowDiscussionService.validateParticipant.mockResolvedValue(true);

      await gateway.handleConnection(mockClient as any);

      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-token', {
        secret: 'jwt-secret',
      });
      expect(mockWorkflowDiscussionService.validateParticipant).toHaveBeenCalledWith(123, 1);
      expect(mockClient.data.user).toEqual(mockUserPayload);
      expect(mockClient.join).toHaveBeenCalledWith('discussion_123');
      expect((gateway as any).rooms.get(123)).toBeDefined();
      expect((gateway as any).rooms.get(123).has('client-id-1')).toBe(true);
      expect(mockClient.disconnect).not.toHaveBeenCalled();
    });

    it('should use token from query if not in auth', async () => {
      const mockClient = {
        handshake: {
          auth: {},
          query: { 
            token: 'query-token',
            discussionId: '123'
          }
        },
        data: {},
        join: jest.fn(),
        disconnect: jest.fn(),
        id: 'client-id-2',
      };

      mockJwtService.verify.mockReturnValue(mockUserPayload);
      mockConfigService.get.mockReturnValue('jwt-secret');
      mockWorkflowDiscussionService.validateParticipant.mockResolvedValue(true);

      await gateway.handleConnection(mockClient as any);

      expect(mockJwtService.verify).toHaveBeenCalledWith('query-token', {
        secret: 'jwt-secret',
      });
    });

    it('should disconnect client when no token is provided', async () => {
      const mockClient = {
        handshake: {
          auth: {},
          query: { discussionId: '123' }
        },
        disconnect: jest.fn(),
      };

      await gateway.handleConnection(mockClient as any);

      expect(mockClient.disconnect).toHaveBeenCalledWith(true);
      expect(mockJwtService.verify).not.toHaveBeenCalled();
    });

    it('should disconnect client when no discussionId is provided', async () => {
      const mockClient = {
        handshake: {
          auth: { token: 'valid-token' },
          query: {}
        },
        disconnect: jest.fn(),
      };

      mockJwtService.verify.mockReturnValue(mockUserPayload);

      await gateway.handleConnection(mockClient as any);

      expect(mockClient.disconnect).toHaveBeenCalledWith(true);
    });

    it('should disconnect client when token verification fails', async () => {
      const mockClient = {
        handshake: {
          auth: { token: 'invalid-token' },
          query: { discussionId: '123' }
        },
        disconnect: jest.fn(),
      };

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await gateway.handleConnection(mockClient as any);

      expect(mockClient.disconnect).toHaveBeenCalledWith(true);
    });

    it('should disconnect client when user is not a participant', async () => {
      const mockClient = {
        handshake: {
          auth: { token: 'valid-token' },
          query: { discussionId: '123' }
        },
        disconnect: jest.fn(),
      };

      mockJwtService.verify.mockReturnValue(mockUserPayload);
      mockWorkflowDiscussionService.validateParticipant.mockRejectedValue(
        new Error('Not a participant')
      );

      await gateway.handleConnection(mockClient as any);

      expect(mockClient.disconnect).toHaveBeenCalledWith(true);
    });

    it('should handle multiple clients in the same room', async () => {
      const mockClient1 = {
        handshake: {
          auth: { token: 'valid-token' },
          query: { discussionId: '123' }
        },
        data: {},
        join: jest.fn(),
        disconnect: jest.fn(),
        id: 'client-id-1',
      };

      const mockClient2 = {
        handshake: {
          auth: { token: 'valid-token' },
          query: { discussionId: '123' }
        },
        data: {},
        join: jest.fn(),
        disconnect: jest.fn(),
        id: 'client-id-2',
      };

      mockJwtService.verify.mockReturnValue(mockUserPayload);
      mockConfigService.get.mockReturnValue('jwt-secret');
      mockWorkflowDiscussionService.validateParticipant.mockResolvedValue(true);

      await gateway.handleConnection(mockClient1 as any);
      await gateway.handleConnection(mockClient2 as any);

      expect((gateway as any).rooms.get(123).size).toBe(2);
      expect((gateway as any).rooms.get(123).has('client-id-1')).toBe(true);
      expect((gateway as any).rooms.get(123).has('client-id-2')).toBe(true);
    });
  });

  describe('handleDisconnect', () => {
    it('should remove client from room and delete room when empty', async () => {
      // First, connect a client
      const mockClient = {
        handshake: {
          auth: { token: 'valid-token' },
          query: { discussionId: '123' }
        },
        data: {},
        join: jest.fn(),
        disconnect: jest.fn(),
        id: 'client-id-1',
      };

      mockJwtService.verify.mockReturnValue(mockUserPayload);
      mockConfigService.get.mockReturnValue('jwt-secret');
      mockWorkflowDiscussionService.validateParticipant.mockResolvedValue(true);

      await gateway.handleConnection(mockClient as any);
      expect((gateway as any).rooms.get(123).size).toBe(1);

      // Then disconnect
      gateway.handleDisconnect(mockClient as any);

      expect((gateway as any).rooms.has(123)).toBe(false);
    });

    it('should remove client but keep room when other clients exist', async () => {
      // Connect two clients
      const mockClient1 = {
        handshake: {
          auth: { token: 'valid-token' },
          query: { discussionId: '123' }
        },
        data: {},
        join: jest.fn(),
        disconnect: jest.fn(),
        id: 'client-id-1',
      };

      const mockClient2 = {
        handshake: {
          auth: { token: 'valid-token' },
          query: { discussionId: '123' }
        },
        data: {},
        join: jest.fn(),
        disconnect: jest.fn(),
        id: 'client-id-2',
      };

      mockJwtService.verify.mockReturnValue(mockUserPayload);
      mockConfigService.get.mockReturnValue('jwt-secret');
      mockWorkflowDiscussionService.validateParticipant.mockResolvedValue(true);

      await gateway.handleConnection(mockClient1 as any);
      await gateway.handleConnection(mockClient2 as any);
      expect((gateway as any).rooms.get(123).size).toBe(2);

      // Disconnect one client
      gateway.handleDisconnect(mockClient1 as any);

      expect((gateway as any).rooms.get(123).size).toBe(1);
      expect((gateway as any).rooms.get(123).has('client-id-2')).toBe(true);
    });

    it('should handle disconnect for client not in any room', () => {
      const mockClient = {
        id: 'unknown-client',
      };

      // Should not throw any error
      expect(() => gateway.handleDisconnect(mockClient as any)).not.toThrow();
    });
  });

  describe('handleNewMessage', () => {
    it('should successfully handle new message and broadcast to room', async () => {
      const mockClient = {
        data: { user: mockUserPayload },
        emit: jest.fn(),
      };

      const payload = {
        discussionId: 123,
        content: 'Test message content',
      };

      mockWorkflowDiscussionService.addMessage.mockResolvedValue(mockMessage);

      await gateway.handleNewMessage(mockClient as any, payload);

      expect(mockWorkflowDiscussionService.addMessage).toHaveBeenCalledWith(
        123,
        { content: 'Test message content' },
        { id: 1 } as User
      );

      expect(mockServer.to).toHaveBeenCalledWith('discussion_123');
      expect(mockServer.emit).toHaveBeenCalledWith('message_created', {
        id: mockMessage.id,
        content: mockMessage.content,
        createdAt: mockMessage.createdAt,
        type: mockMessage.type,
        phase: mockMessage.phase,
        author: {
          id: mockMessage.author.id,
          firstName: mockMessage.author.firstName,
          lastName: mockMessage.author.lastName,
          email: mockMessage.author.email,
          image: mockMessage.author.image,
          role: mockMessage.author.role?.name,
        },
      });
    });

    it('should send error to client when user is not authenticated', async () => {
      const mockClient = {
        data: {}, // No user
        emit: jest.fn(),
      };

      const payload = {
        discussionId: 123,
        content: 'Test message',
      };

      await gateway.handleNewMessage(mockClient as any, payload);

      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        message: 'Unauthorized',
      });
      expect(mockWorkflowDiscussionService.addMessage).not.toHaveBeenCalled();
    });

    it('should send error to client when message creation fails', async () => {
      const mockClient = {
        data: { user: mockUserPayload },
        emit: jest.fn(),
      };

      const payload = {
        discussionId: 123,
        content: 'Test message',
      };

      const error = new Error('Failed to create message');
      mockWorkflowDiscussionService.addMessage.mockRejectedValue(error);

      await gateway.handleNewMessage(mockClient as any, payload);

      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        message: 'Failed to create message',
      });
    });

    it('should handle empty message content', async () => {
      const mockClient = {
        data: { user: mockUserPayload },
        emit: jest.fn(),
      };

      const payload = {
        discussionId: 123,
        content: '',
      };

      mockWorkflowDiscussionService.addMessage.mockResolvedValue({
        ...mockMessage,
        content: '',
      });

      await gateway.handleNewMessage(mockClient as any, payload);

      expect(mockWorkflowDiscussionService.addMessage).toHaveBeenCalledWith(
        123,
        { content: '' },
        { id: 1 } as User
      );
    });
  });

  describe('handleTyping', () => {
    it('should broadcast typing event to other clients in room', () => {
      const mockClient = {
        data: { user: mockUserPayload },
        broadcast: {
          to: jest.fn().mockReturnThis(),
          emit: jest.fn(),
        },
      };

      const payload = {
        discussionId: 123,
      };

      gateway.handleTyping(mockClient as any, payload);

      expect(mockClient.broadcast.to).toHaveBeenCalledWith('discussion_123');
      expect(mockClient.broadcast.emit).toHaveBeenCalledWith('typing', {
        discussionId: 123,
        userId: mockUserPayload.sub,
      });
    });

    it('should not broadcast typing event when user is not authenticated', () => {
      const mockClient = {
        data: {}, // No user
        broadcast: {
          to: jest.fn().mockReturnThis(),
          emit: jest.fn(),
        },
      };

      const payload = {
        discussionId: 123,
      };

      gateway.handleTyping(mockClient as any, payload);

      expect(mockClient.broadcast.to).not.toHaveBeenCalled();
      expect(mockClient.broadcast.emit).not.toHaveBeenCalled();
    });

    it('should handle multiple typing events', () => {
      const mockClient1 = {
        data: { user: { sub: 1 } },
        broadcast: {
          to: jest.fn().mockReturnThis(),
          emit: jest.fn(),
        },
      };

      const mockClient2 = {
        data: { user: { sub: 2 } },
        broadcast: {
          to: jest.fn().mockReturnThis(),
          emit: jest.fn(),
        },
      };

      const payload = { discussionId: 123 };

      gateway.handleTyping(mockClient1 as any, payload);
      gateway.handleTyping(mockClient2 as any, payload);

      expect(mockClient1.broadcast.emit).toHaveBeenCalledWith('typing', {
        discussionId: 123,
        userId: 1,
      });

      expect(mockClient2.broadcast.emit).toHaveBeenCalledWith('typing', {
        discussionId: 123,
        userId: 2,
      });
    });
  });

  describe('room management', () => {
    it('should handle multiple rooms simultaneously', async () => {
      const mockClient1 = {
        handshake: {
          auth: { token: 'valid-token' },
          query: { discussionId: '123' }
        },
        data: {},
        join: jest.fn(),
        disconnect: jest.fn(),
        id: 'client-id-1',
      };

      const mockClient2 = {
        handshake: {
          auth: { token: 'valid-token' },
          query: { discussionId: '456' }
        },
        data: {},
        join: jest.fn(),
        disconnect: jest.fn(),
        id: 'client-id-2',
      };

      mockJwtService.verify.mockReturnValue(mockUserPayload);
      mockConfigService.get.mockReturnValue('jwt-secret');
      mockWorkflowDiscussionService.validateParticipant.mockResolvedValue(true);

      await gateway.handleConnection(mockClient1 as any);
      await gateway.handleConnection(mockClient2 as any);

      expect((gateway as any).rooms.has(123)).toBe(true);
      expect((gateway as any).rooms.has(456)).toBe(true);
      expect((gateway as any).rooms.get(123).size).toBe(1);
      expect((gateway as any).rooms.get(456).size).toBe(1);
    });

    it('should clean up rooms properly when all clients disconnect', async () => {
      const mockClient = {
        handshake: {
          auth: { token: 'valid-token' },
          query: { discussionId: '123' }
        },
        data: {},
        join: jest.fn(),
        disconnect: jest.fn(),
        id: 'client-id-1',
      };

      mockJwtService.verify.mockReturnValue(mockUserPayload);
      mockConfigService.get.mockReturnValue('jwt-secret');
      mockWorkflowDiscussionService.validateParticipant.mockResolvedValue(true);

      await gateway.handleConnection(mockClient as any);
      expect((gateway as any).rooms.has(123)).toBe(true);

      gateway.handleDisconnect(mockClient as any);
      expect((gateway as any).rooms.has(123)).toBe(false);
    });
  });
});