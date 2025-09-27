import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CahierDesCharges } from '../../cahier-des-charges/entities/cahier-des-charge.entity';
import { Devis } from '../../devis/entities/devi.entity';
import { Order } from '../../order/entities/order.entity';
import { Project } from '../../project/entities/project.entity';
import { WorkflowMessage } from './workflow-message.entity';

export enum WorkflowPhase {
  CDC = 'cdc',
  DEVIS = 'devis',
  ORDER = 'order',
  PROJECT = 'project',
}

@Entity('workflow_discussions')
export class WorkflowDiscussion {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => CahierDesCharges, { cascade: true })
  @JoinColumn()
  cdc: CahierDesCharges;

  @OneToOne(() => Devis, { nullable: true })
  @JoinColumn()
  devis?: Devis;

  @OneToMany(() => Order, (order) => order.discussion)
  orders?: Order[];

  @OneToMany(() => Project, (project) => project.discussion)
  projects?: Project[];

  @OneToMany(() => WorkflowMessage, (message) => message.discussion, {
    cascade: true,
  })
  messages: WorkflowMessage[];

  @Column({
    type: 'enum',
    enum: WorkflowPhase,
    default: WorkflowPhase.CDC,
  })
  currentPhase: WorkflowPhase;


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updateddAt: Date;
}
