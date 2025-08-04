// workflow-discussion.entity.ts
import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CahierDesCharges } from '../../cahier-des-charges/entities/cahier-des-charge.entity';
import { Devis } from '../../devis/entities/devi.entity';
import { Order } from '../../order/entities/order.entity';
import { Project } from '../../project/entities/project.entity';
import { WorkflowMessage } from './workflow-message.entity';

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

  @OneToMany(() => Order, order => order.discussion)
  orders?: Order[];

  @OneToMany(() => Project, project => project.discussion)
  projects?: Project[];

  @OneToMany(() => WorkflowMessage, message => message.discussion)
  messages: WorkflowMessage[];

  @Column({ type: 'enum', enum: ['cdc', 'devis', 'order', 'project'], default: 'cdc' })
  currentPhase: string;

  @CreateDateColumn()
  createdAt: Date;
}