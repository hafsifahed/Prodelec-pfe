import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from '../../order/entities/order.entity';
import { User } from '../../users/entities/users.entity';
import { WorkflowDiscussion } from '../../workflow-discussion/entities/workflow-discussion.entity';

@Entity('project')
export class Project {
  @PrimaryGeneratedColumn()
  idproject: number;

  @Column({ nullable: true })
  refClient: string;

  @Column({ nullable: true })
  refProdelec: string;

  @Column({ type: 'int', nullable: true })
  qte: number;

  @Column({ type: 'timestamp', nullable: true })
  dlp: Date;

  @Column({ type: 'int', nullable: true })
  duree: number;

  @Column({ type: 'float', default: 0.0 })
  progress: number;

  @Column({ default: false })
  archivera: boolean;

  @Column({ default: false })
  archiverc: boolean;

  // Conception
  @ManyToOne(() => User, { nullable: true })
  conceptionResponsible: User;

  @Column({ nullable: true })
  conceptionComment: string;

  @Column({ type: 'int', nullable: true })
  conceptionDuration: number;

  @Column({ default: false })
  conceptionStatus: boolean;

  @Column({ type: 'float', default: 0.0 })
  conceptionprogress: number;

  @Column({ type: 'timestamp', nullable: true })
  startConception: Date;

  @Column({ type: 'timestamp', nullable: true })
  endConception: Date;

  @Column({ type: 'timestamp', nullable: true })
  realendConception: Date;

  // Méthode
  @ManyToOne(() => User, { nullable: true })
  methodeResponsible: User;

  @Column({ nullable: true })
  methodeComment: string;

  @Column({ type: 'int', nullable: true })
  methodeDuration: number;

  @Column({ default: false })
  methodeStatus: boolean;

  @Column({ type: 'float', default: 0.0 })
  methodeprogress: number;

  @Column({ type: 'timestamp', nullable: true })
  startMethode: Date;

  @Column({ type: 'timestamp', nullable: true })
  endMethode: Date;

  @Column({ type: 'timestamp', nullable: true })
  realendMethode: Date;

  // Production
  @ManyToOne(() => User, { nullable: true })
  productionResponsible: User;

  @Column({ nullable: true })
  productionComment: string;

  @Column({ type: 'int', nullable: true })
  productionDuration: number;

  @Column({ default: false })
  productionStatus: boolean;

  @Column({ type: 'float', default: 0.0 })
  productionprogress: number;

  @Column({ type: 'timestamp', nullable: true })
  startProduction: Date;

  @Column({ type: 'timestamp', nullable: true })
  endProduction: Date;

  @Column({ type: 'timestamp', nullable: true })
  realendProduction: Date;

  // Contrôle final
  @ManyToOne(() => User, { nullable: true })
  finalControlResponsible: User;

  @Column({ nullable: true })
  finalControlComment: string;

  @Column({ type: 'int', nullable: true })
  finalControlDuration: number;

  @Column({ default: false })
  finalControlStatus: boolean;

  @Column({ type: 'float', default: 0.0 })
  fcprogress: number;

  @Column({ type: 'timestamp', nullable: true })
  startFc: Date;

  @Column({ type: 'timestamp', nullable: true })
  endFc: Date;

  @Column({ type: 'timestamp', nullable: true })
  realendFc: Date;

  // Livraison
  @ManyToOne(() => User, { nullable: true })
  deliveryResponsible: User;

  @Column({ nullable: true })
  deliveryComment: string;

  @Column({ type: 'int', nullable: true })
  deliveryDuration: number;

  @Column({ default: false })
  deliveryStatus: boolean;

  @Column({ type: 'float', default: 0.0 })
  deliveryprogress: number;

  @Column({ type: 'timestamp', nullable: true })
  startDelivery: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDelivery: Date;

  @Column({ type: 'timestamp', nullable: true })
  realendDelivery: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Order, { nullable: true })
  order: Order;

  @ManyToOne(() => WorkflowDiscussion, discussion => discussion.projects)
discussion: WorkflowDiscussion;
}
