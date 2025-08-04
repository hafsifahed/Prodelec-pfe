// workflow-message.entity.ts
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { WorkflowDiscussion } from './workflow-discussion.entity';

@Entity('workflow_messages')
export class WorkflowMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @ManyToOne(() => User, { eager: true })
  author: User;

  @ManyToOne(() => WorkflowDiscussion, discussion => discussion.messages)
  discussion: WorkflowDiscussion;

  @Column({ type: 'enum', enum: ['message', 'system_event'], default: 'message' })
  type: string;

  @CreateDateColumn()
  createdAt: Date;
}