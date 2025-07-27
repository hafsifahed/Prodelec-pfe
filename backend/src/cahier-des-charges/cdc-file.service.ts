import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CahierDesCharges, EtatCahier } from './entities/cahier-des-charge.entity';
import { CdcFile } from './entities/cdc-file.entity';

@Injectable()
export class CdcFileService {
  constructor(
    @InjectRepository(CdcFile)
    private readonly repository: Repository<CdcFile>,

    @InjectRepository(CahierDesCharges)
    private readonly cdcRepository: Repository<CahierDesCharges>,
  ) {}

  async createFile(nomFichier: string, chemin: string, cdcId: number): Promise<CdcFile> {
  const cdc = await this.cdcRepository.findOne({ where: { id: cdcId } });

  if (!cdc) {
    throw new NotFoundException(`Cahier des charges avec id ${cdcId} non trouvé.`);
  }

  // Seul l'état En attente ou À compléter autorise l'ajout de fichier
  if (
    cdc.etat !== EtatCahier.EnAttente &&
    cdc.etat !== EtatCahier.ACompleter
  ) {
    throw new BadRequestException(
      `Impossible d'ajouter un fichier : l'état du cahier doit être "En attente" ou "À compléter". État actuel : ${cdc.etat}`
    );
  }

  // Création du fichier lié
  const file = this.repository.create({
    nomFichier,
    chemin,
    cahierDesCharges: { id: cdcId } as any,
  });

  const savedFile = await this.repository.save(file);

  // Mettre à jour l'état du cahier à "En attente" (même s'il était "À compléter")
  if (cdc.etat !== EtatCahier.EnAttente) {
    cdc.etat = EtatCahier.EnAttente;
    await this.cdcRepository.save(cdc);
  }

  return savedFile;
}


  async deleteFile(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async getFilesByCdcId(cdcId: number): Promise<CdcFile[]> {
    return this.repository.find({
      where: { cahierDesCharges: { id: cdcId } },
      order: { id: 'ASC' },
    });
  }
}
