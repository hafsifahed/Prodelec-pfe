import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/entities/users.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column({ type: 'json', nullable: true })
  payload: any;

  @Column({ default: false })
  read: boolean;

  // Utilisateur destinataire de la notification
  @ManyToOne(() => User, user => user.notifications, { eager: true })
  user: User;

  // Utilisateur qui a créé la notification (optionnel)
  @ManyToOne(() => User, { nullable: true, eager: true })
  createdBy?: User;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
