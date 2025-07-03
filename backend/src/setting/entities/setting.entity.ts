import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  reclamationTarget: number;

  // Liste d'emails pour les réclamations, stockée comme chaîne CSV
  @Column('simple-array', { nullable: true })
  reclamationEmails: string[];

  // Liste d'emails pour recevoir les avis
  @Column('simple-array', { nullable: true })
  avisEmails: string[];

  // Liste d'emails pour les devis
  @Column('simple-array', { nullable: true })
  devisEmails: string[];

  // Liste d'emails pour les cahiers des charges
  @Column('simple-array', { nullable: true })
  cahierDesChargesEmails: string[];

  // Liste globale d'emails
  @Column('simple-array', { nullable: true })
  globalEmails: string[];
}
