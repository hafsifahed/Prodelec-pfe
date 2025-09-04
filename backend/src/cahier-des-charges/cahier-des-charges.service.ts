import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { join } from 'path';
import { Repository } from 'typeorm';
import { NotificationsService } from '../notifications/notifications.service';
import { Role } from '../roles/enums/roles.enum';
import { User } from '../users/entities/users.entity';
import { WorkflowDiscussionService } from '../workflow-discussion/workflow-discussion.service';
import { CahierDesChargesController } from './cahier-des-charges.controller';
import { CdcFileService } from './cdc-file.service';
import { CreateCahierDesChargesDto } from './dto/create-cahier-des-charge.dto';
import { CahierDesCharges, EtatCahier } from './entities/cahier-des-charge.entity';

@Injectable()
export class CahierDesChargesService {
  constructor(
    @InjectRepository(CahierDesCharges)
    private readonly repository: Repository<CahierDesCharges>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly notificationsService: NotificationsService,

    private readonly cdcFileService: CdcFileService,
    private readonly discussionService:WorkflowDiscussionService
  ) {}

  async saveCahierDesCharges(dto: CreateCahierDesChargesDto): Promise<CahierDesCharges> {
    const user = await this.userRepository.findOneBy({ id: dto.user.id });
    if (!user) throw new NotFoundException('User not found');

    const cdcData = {
      titre: dto.titre,
      description: dto.description,
      commentaire: dto.commentaire,
      etat: dto.etat || EtatCahier.EnAttente,
      archive: dto.archive || false,
      archiveU: dto.archiveU || false,
      user,
    };

    const cdc = this.repository.create(cdcData);
    const savedCdc = await this.repository.save(cdc);

    if (dto.fileNames && dto.fileNames.length > 0) {
      for (const filename of dto.fileNames) {
        const chemin = this.getFilePath(user.username, filename);
        await this.cdcFileService.createFile(filename, chemin, savedCdc.id);
      }
    }

    await this.notificationsService.notifyResponsablesByRole(
      Role.RESPONSABLE_INDUSTRIALISATION,
      'Nouveau cahier des charges soumis',
      `Par ${user.username}`,
      { cdcId: savedCdc.id, userId: user.id, username: user.username },
    );
  await this.discussionService.createDiscussionForCDC(savedCdc.id);

    return savedCdc;
  }


  private getFilePath(username: string, filename: string): string {
    return join(CahierDesChargesController.BASE_DIRECTORY, username.toString(), 'Cahier des charges', filename);
  }

  async addFileToCdc(cdcId: number, filename: string, username: string) {
    const chemin = this.getFilePath(username, filename);
    return this.cdcFileService.createFile(filename, chemin, cdcId);
  }

  async removeFile(fileId: number): Promise<void> {
    await this.cdcFileService.deleteFile(fileId);
      // Optionnel : supprimer physiquement le fichier ici si nécessaire

  }

  async markAsIncomplete(id: number, commentaire: string): Promise<CahierDesCharges> {
    const cdc = await this.repository.findOne({ where: { id }, relations: ['user'] });
    if (!cdc) throw new NotFoundException("Ce Cahier n'existe pas");

    cdc.etat = EtatCahier.ACompleter;
    cdc.commentaire = commentaire;
    const updatedCdc = await this.repository.save(cdc);

    await this.notificationsService.createAndSendNotification(
      cdc.user,
      'Cahier des charges incomplet',
      `Votre cahier des charges nécessite des modifications: ${commentaire}`,
      { cdcId: updatedCdc.id, etat: updatedCdc.etat, commentaire },
    );

    return updatedCdc;
  }

  async getAllCahierDesCharges(): Promise<CahierDesCharges[]> {
  return this.repository
    .createQueryBuilder('cdc')
    .leftJoinAndSelect('cdc.files', 'file')
    .leftJoinAndSelect('cdc.user', 'user')
    .leftJoinAndSelect('user.partner', 'partner')
    .orderBy(`
      CASE cdc.etat
        WHEN '${EtatCahier.EnAttente}' THEN 1
        WHEN '${EtatCahier.Accepte}' THEN 2
        WHEN '${EtatCahier.ACompleter}' THEN 3
        WHEN '${EtatCahier.Refuse}' THEN 4
        ELSE 5
      END
    `, 'ASC')
    .addOrderBy('cdc.createdAt', 'DESC')
    .getMany();
}
/* getAllCahierDesCharges(): Promise<CahierDesCharges[]> {
    return this.repository.find({ relations: ['files', 'user'], order: { createdAt: 'DESC' } });
  }*/

  async getCahierDesChargesById(id: number): Promise<CahierDesCharges> {
    const cdc = await this.repository.findOne({ where: { id }, relations: ['files', 'user'] });
    if (!cdc) throw new NotFoundException("Ce Cahier n'existe pas");
    return cdc;
  }

  async deleteCahierDesCharges(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async getCahierDesChargesByUser(user: User): Promise<CahierDesCharges[] | null> {
  if (!user) return null;

  return this.repository
    .createQueryBuilder('cdc')
    .leftJoinAndSelect('cdc.files', 'file')       // fichiers du cahier
    .leftJoinAndSelect('cdc.user', 'user')       // utilisateur
    .leftJoinAndSelect('user.partner', 'partner') // partenaire de l'utilisateur
    .where('cdc.userId = :userId', { userId: user.id })
    .orderBy(`
      CASE cdc.etat
        WHEN :aCompleter THEN 1
        WHEN :accepte THEN 2
        WHEN :enAttente THEN 3
        WHEN :refuse THEN 4
        ELSE 5
      END
    `, 'ASC')
    .addOrderBy('cdc.createdAt', 'DESC')
    .setParameters({
      aCompleter: EtatCahier.ACompleter,
      accepte: EtatCahier.Accepte,
      enAttente: EtatCahier.EnAttente,
      refuse: EtatCahier.Refuse,
    })
    .getMany();
}



  updateCahierDesCharges(updatedCdc: CahierDesCharges): Promise<CahierDesCharges> {
    return this.repository.save(updatedCdc);
  }

  async acceptCahierDesCharges(id: number): Promise<CahierDesCharges> {
    const cdc = await this.repository.findOne({ where: { id }, relations: ['user'] });
    if (!cdc) throw new NotFoundException("Ce Cahier n'existe pas");

    cdc.etat = EtatCahier.Accepte;
    const updatedCdc = await this.repository.save(cdc);

    await this.notificationsService.createAndSendNotification(
      cdc.user,
      'Cahier des charges accepté',
      `Votre cahier des charges a été accepté.`,
      { cdcId: updatedCdc.id, etat: updatedCdc.etat },
    );

    return updatedCdc;
  }

  async refuseCahierDesCharges(id: number, commentaire: string): Promise<CahierDesCharges> {
    const cdc = await this.repository.findOne({ where: { id }, relations: ['user'] });
    if (!cdc) throw new NotFoundException("Ce Cahier n'existe pas");

    cdc.etat = EtatCahier.Refuse;
    cdc.commentaire = commentaire;
    const updatedCdc = await this.repository.save(cdc);

    await this.notificationsService.createAndSendNotification(
      cdc.user,
      'Cahier des charges refusé',
      `Votre cahier des charges a été refusé. Commentaire : ${commentaire}`,
      { cdcId: updatedCdc.id, etat: updatedCdc.etat, commentaire },
    );

    return updatedCdc;
  }

  async archiver(id: number): Promise<CahierDesCharges> {
    const cdc = await this.repository.findOne({ where: { id } });
    if (!cdc) throw new NotFoundException("Ce Cahier n'existe pas");
    cdc.archive = true;
    return this.repository.save(cdc);
  }

  async restorer(id: number): Promise<CahierDesCharges> {
    const cdc = await this.repository.findOne({ where: { id } });
    if (!cdc) throw new NotFoundException("Ce Cahier n'existe pas");
    cdc.archive = false;
    return this.repository.save(cdc);
  }

  async archiverU(id: number): Promise<CahierDesCharges> {
    const cdc = await this.repository.findOne({ where: { id } });
    if (!cdc) throw new NotFoundException("Ce Cahier n'existe pas");
    cdc.archiveU = true;
    return this.repository.save(cdc);
  }

  async restorerU(id: number): Promise<CahierDesCharges> {
    const cdc = await this.repository.findOne({ where: { id } });
    if (!cdc) throw new NotFoundException("Ce Cahier n'existe pas");
    cdc.archiveU = false;
    return this.repository.save(cdc);
  }
}
