import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { WorkflowDiscussion } from './workflow-discussion.entity';

export enum WorkflowMessageType {
  MESSAGE = 'message',
  SYSTEM_EVENT = 'system_event',
}

export enum WorkflowPhase {
  CDC = 'cdc',
  DEVIS = 'devis',
  ORDER = 'order',
  PROJECT = 'project',
}

@Entity('workflow_messages')
export class WorkflowMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @ManyToOne(() => User, { eager: true })
  author: User;

  @ManyToOne(() => WorkflowDiscussion, (discussion) => discussion.messages)
  discussion: WorkflowDiscussion;

  @Column({
    type: 'enum',
    enum: WorkflowMessageType,
    default: WorkflowMessageType.MESSAGE,
  })
  type: WorkflowMessageType;

  @Column({
    type: 'enum',
    enum: WorkflowPhase,
    enumName: 'workflow_phase_enum', // Ajout crucial
    nullable: true,
  })
  phase: WorkflowPhase;

  @CreateDateColumn()
  createdAt: Date;
}