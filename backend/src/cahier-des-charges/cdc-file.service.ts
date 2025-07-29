import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsService } from '../notifications/notifications.service';
import { Role } from '../roles/enums/roles.enum';
import { CahierDesCharges, EtatCahier } from './entities/cahier-des-charge.entity';
import { CdcFile } from './entities/cdc-file.entity';

@Injectable()
export class CdcFileService {
  constructor(
    @InjectRepository(CdcFile)
    private readonly repository: Repository<CdcFile>,

    @InjectRepository(CahierDesCharges)
    private readonly cdcRepository: Repository<CahierDesCharges>,

    private readonly notificationsService: NotificationsService,
  ) {}

  async createFile(nomFichier: string, chemin: string, cdcId: number): Promise<CdcFile> {
    const cdc = await this.cdcRepository.findOne({ where: { id: cdcId } });

    if (!cdc) {
      throw new NotFoundException(`Cahier des charges avec id ${cdcId} non trouvé.`);
    }

    // Autoriser ajout si EnAttente, ACompleter, ou Refuse
    if (
      cdc.etat !== EtatCahier.EnAttente &&
      cdc.etat !== EtatCahier.ACompleter &&
      cdc.etat !== EtatCahier.Refuse
    ) {
      throw new BadRequestException(
        `Impossible d'ajouter un fichier : l'état du cahier doit être "En attente", "À compléter" ou "Refusé". État actuel : ${cdc.etat}`
      );
    }

    const file = this.repository.create({
      nomFichier,
      chemin,
      cahierDesCharges: { id: cdcId },  // IMPORTANT: objet avec id
    });

    const savedFile = await this.repository.save(file);

    // Mettre à jour l'état du cahier à "En attente" si nécessaire
    if (cdc.etat !== EtatCahier.EnAttente) {
      cdc.etat = EtatCahier.EnAttente;
      await this.cdcRepository.save(cdc);
       await this.notificationsService.notifyResponsablesByRole(
      Role.RESPONSABLE_INDUSTRIALISATION,
      'Nouveau fichier complémentaire ajouté',
      `Un nouveau fichier "${nomFichier}" a été ajouté au cahier des charges #${cdcId}.`,
      { cdcId, fichierId: savedFile.id }
    );
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
