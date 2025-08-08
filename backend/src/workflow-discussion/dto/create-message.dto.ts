// create-message.dto.ts
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { WorkflowMessageType } from '../entities/workflow-message.entity';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(WorkflowMessageType)
  type?: WorkflowMessageType;

  constructor(content: string, type?: WorkflowMessageType) {
    this.content = content;
    this.type = type;
  }
}