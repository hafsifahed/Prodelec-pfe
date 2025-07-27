import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CahierDesCharges } from './cahier-des-charge.entity';

@Entity('cdc_files')
export class CdcFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nomFichier: string;

  @Column()
  chemin: string;

  @ManyToOne(() => CahierDesCharges, cdc => cdc.files, { onDelete: 'CASCADE' })
  cahierDesCharges: CahierDesCharges;
}
