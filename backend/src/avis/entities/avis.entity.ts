import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/users.entity';
  
  @Entity('avis')
  export class Avis {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ nullable: true })
    conformiteExigences: string;
  
    @Column({ nullable: true })
    reactiviteTechnique: string;
  
    @Column({ nullable: true })
    reactiviteReclamations: string;
  
    @Column({ nullable: true })
    reactiviteOffres: string;
  
    @Column({ nullable: true })
    conformiteBesoins: string;
  
    @Column({ nullable: true })
    documentationProduit: string;
  
    @Column({ nullable: true })
    evolutionsTechnologiques: string;
  
    @Column({ nullable: true })
    performanceEtude: string;
  
    @Column({ nullable: true })
    conformiteProduit: string;
  
    @Column({ nullable: true })
    respectLivraison: string;
  
    @Column({ nullable: true })
    respectSpecifications: string;
  
    @Column({ nullable: true })
    accueilTelephonique: string;
  
    @Column({ nullable: true })
    qualiteRelationnelle: string;
  
    @Column({ nullable: true })
    qualiteSite: string;
  
    @Column({ nullable: true })
    pointFort: string;
  
    @Column({ nullable: true })
    nomPrenom: string;
  
    @Column({ nullable: true })
    visa: string;
  
    @Column({ type: 'int', nullable: true })
    avg: number;
  
    @Column({ nullable: true })
    reactivite: string;
  
    @Column({ nullable: true })
    delaisintervention: string;
  
    @Column({ nullable: true })
    gammeproduits: string;
  
    @Column({ nullable: true })
    clartesimplicite: string;
  
    @Column({ nullable: true })
    delaidereponse: string;
  
    @Column({ nullable: true })
    deviscomm: string;
  
    @Column({ nullable: true })
    reactivitecomm: string;
  
    @Column({ nullable: true })
    develocomm: string;
  
    @Column({ nullable: true })
    presentationcomm: string;
  
    @Column({ nullable: true })
    savcomm: string;
  
    @Column({ nullable: true })
    elementcomm: string;
  
    @Column({ nullable: true })
    pointFort1: string;
  
    @Column({ nullable: true })
    pointFort2: string;
  
    @Column({ nullable: true })
    pointFort3: string;
  
    @Column({ nullable: true })
    pointFort4: string;
  
    @Column({ nullable: true })
    pointFort5: string;
  
    @Column({ nullable: true })
    pointFaible1: string;
  
    @Column({ nullable: true })
    pointFaible2: string;
  
    @Column({ nullable: true })
    pointFaible3: string;
  
    @Column({ nullable: true })
    pointFaible4: string;
  
    @Column({ nullable: true })
    pointFaible5: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @ManyToOne(() => User, user => user.avis, { eager: false })
    user: User;
  }
  