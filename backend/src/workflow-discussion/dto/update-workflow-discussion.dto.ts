import { PartialType } from '@nestjs/swagger';
import { CreateWorkflowDiscussionDto } from './create-workflow-discussion.dto';

export class UpdateWorkflowDiscussionDto extends PartialType(CreateWorkflowDiscussionDto) {}
