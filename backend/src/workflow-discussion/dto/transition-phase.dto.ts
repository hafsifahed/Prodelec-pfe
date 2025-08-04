import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { WorkflowPhase } from '../entities/workflow-discussion.entity';

export class TransitionPhaseDto {
  @IsEnum([WorkflowPhase.DEVIS, WorkflowPhase.ORDER, WorkflowPhase.PROJECT])
  targetPhase: WorkflowPhase;

  @IsOptional()
  @IsNumber()
  targetEntityId?: number; // To link existing devis/order/project
}
