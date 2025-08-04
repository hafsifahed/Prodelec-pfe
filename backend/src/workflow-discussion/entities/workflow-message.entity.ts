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

  @CreateDateColumn()
  createdAt: Date;
}
