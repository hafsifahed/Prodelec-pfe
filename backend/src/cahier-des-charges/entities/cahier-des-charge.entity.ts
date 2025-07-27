import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { CdcFile } from './cdc-file.entity';

export enum EtatCahier {
  EnAttente = 'En attente',
  Accepte = 'Accepté',
  ACompleter = 'À compléter',
  Refuse = 'Refusé',
}

@Entity('cahier_des_charges')
export class CahierDesCharges {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titre: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => CdcFile, file => file.cahierDesCharges, { cascade: true, eager: true })
  files: CdcFile[];

  @Column({ nullable: true })
  commentaire?: string;

  @Column({ type: 'varchar', default: EtatCahier.EnAttente })
etat: EtatCahier;


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
