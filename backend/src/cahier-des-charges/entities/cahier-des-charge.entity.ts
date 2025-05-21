// src/cdc/entities/cahier-des-charges.entity.ts
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/users.entity';

@Entity('cahier_des_charges')
export class CahierDesCharges {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titre: string;

  @Column({ default: 'En attente' })
  etat: string;

  @Column({ nullable: true })
  commentaire: string;

  @Column({ default: false })
  archive: boolean;

  @Column({ default: false })
  archiveU: boolean;

  @ManyToOne(() => User, user => user.cahierDesCharges)
  user: User;

  /*@CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;*/

}
