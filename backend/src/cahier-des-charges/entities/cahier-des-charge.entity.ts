import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/users.entity';

@Entity('cahier_des_charges')
export class CahierDesCharges {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titre: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  pieceJointe: string;

  @Column({ nullable: true })
  commentaire: string;

  @Column({ default: 'En attente' })
  etat: string;

  @Column({ default: false })
  archive: boolean;

  @Column({ default: false })
  archiveU: boolean;

  @ManyToOne(() => User, user => user.cahierDesCharges, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
