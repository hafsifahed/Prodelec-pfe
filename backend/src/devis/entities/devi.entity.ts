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
  
  @Entity('devis')
  export class Devis {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    projet: string;
  
    @Column({ nullable: true })
    pieceJointe: string;
  
    @Column({ default: 'En attente' })
    etat: string;
  
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
  