import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { TypeReclamation } from '../enums/type-reclamation.enum';

@Entity()
export class Reclamation {
  @PrimaryGeneratedColumn()
  id_reclamation: number;

  @Column()
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateDeCreation: Date;

  @Column({ nullable: true })
  PieceJointe: string;

  @Column({ default: 'En cours' })
  status: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  Reponse: string;

  // Use enum type here
  @Column({
    type: 'enum',
    enum: TypeReclamation,
  })
  type_de_defaut: TypeReclamation;

  @Column({ default: false })
  archive: boolean;

  @Column({ default: false })
  archiveU: boolean;
}
