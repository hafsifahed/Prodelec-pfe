import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CahierDesCharges } from '../../cahier-des-charges/entities/cahier-des-charge.entity';
import { User } from '../../users/entities/users.entity';
  
export enum EtatDevis {
  EnAttente = 'En attente',
  Accepte = 'Accepté',
  Refuse = 'Refusé',
  Negociation = 'Négociation',   // <-- nouvel état
}

  @Entity('devis')
  export class Devis {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    numdevis: string;
  
    @Column()
    projet: string;
  
    @Column({ nullable: true })
    pieceJointe: string;
  
    @Column({ default: EtatDevis.EnAttente })
etat: EtatDevis; // ou utiliser enum: EtatDevis

  
    @Column({ nullable: true })
    commentaire: string;
  
    @CreateDateColumn()
    dateCreation: Date;
  
    @OneToOne(() => CahierDesCharges)
    @JoinColumn()
    cahierDesCharges: CahierDesCharges;
  
    @ManyToOne(() => User, user => user.devis)
    user: User;
  
    @Column({ default: false })
    archive: boolean;
  
    @Column({ default: false })
    archiveU: boolean;

    @CreateDateColumn({ type: 'timestamp' })
      createdAt: Date;
    
      @UpdateDateColumn({ type: 'timestamp' })
      updatedAt: Date;
  }
  