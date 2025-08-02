import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Devis } from '../../devis/entities/devi.entity';
import { Project } from '../../project/entities/project.entity'; // adapte le chemin
import { User } from '../../users/entities/users.entity';

@Entity('orderprod')
export class Order {
  @PrimaryGeneratedColumn()
  idOrder: number;

  @Column({ nullable: true })
  orderName: string;

  @Column({ nullable: true })
  attachementName: string;

  @Column({ default: false })
  annuler: boolean;

  @Column({ default: false })
  archivera: boolean;

  @Column({ default: false })
  archiverc: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.orders, { eager: true })
  user: User;

  @OneToMany(() => Project, project => project.order)
  projects: Project[];

   @ManyToOne(() => Devis, devis => devis.orders, { eager: true, nullable: true })
  devis: Devis;
}
