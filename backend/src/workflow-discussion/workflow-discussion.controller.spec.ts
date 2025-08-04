import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowDiscussionController } from './workflow-discussion.controller';
import { WorkflowDiscussionService } from './workflow-discussion.service';

describe('WorkflowDiscussionController', () => {
  let controller: WorkflowDiscussionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkflowDiscussionController],
      providers: [WorkflowDiscussionService],
    }).compile();

    controller = module.get<WorkflowDiscussionController>(WorkflowDiscussionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
