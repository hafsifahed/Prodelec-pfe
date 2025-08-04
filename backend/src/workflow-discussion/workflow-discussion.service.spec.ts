import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowDiscussionService } from './workflow-discussion.service';

describe('WorkflowDiscussionService', () => {
  let service: WorkflowDiscussionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkflowDiscussionService],
    }).compile();

    service = module.get<WorkflowDiscussionService>(WorkflowDiscussionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
