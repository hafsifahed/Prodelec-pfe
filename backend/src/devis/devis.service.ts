import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CahierDesCharges } from '../cahier-des-charges/entities/cahier-des-charge.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { Role } from '../roles/enums/roles.enum';
import { User } from '../users/entities/users.entity';
import { Devis, EtatDevis } from './entities/devi.entity';

@Injectable()
export class DevisService {
  constructor(
    @InjectRepository(Devis)
    private readonly devisRepo: Repository<Devis>,
    @InjectRepository(CahierDesCharges)
    private readonly cdcRepo: Repository<CahierDesCharges>,
    private notificationsService:NotificationsService,
  ) {}

async saveDevis(cdcId: number, pieceJointe: string, numdevis: string): Promise<Devis> {
  const cdc = await this.cdcRepo.findOne({ where: { id: cdcId }, relations: ['user'] });
  if (!cdc) throw new NotFoundException('Cahier des Charges not found');

  const devis = this.devisRepo.create({
    pieceJointe,
    numdevis, // Ajout ici
    projet: cdc.titre,
    commentaire: '',
    user: cdc.user,
    cahierDesCharges: cdc,
    dateCreation: new Date(),
    etat: EtatDevis.EnAttente
  });

  const savedDevis = await this.devisRepo.save(devis);

  // Notification à l’utilisateur lié au CDC
  await this.notificationsService.createAndSendNotification(
    cdc.user,
    'Nouveau devis créé',
    `Un devis (#${numdevis}) a été créé pour le cahier des charges "${cdc.titre}".`,
    { devisId: savedDevis.id }
  );

  return savedDevis;
}



  findAll(): Promise<Devis[]> {
    return this.devisRepo.find({ relations: ['user', 'cahierDesCharges'] });
  }

  findByUser(user: User): Promise<Devis[]> {
    if (!user) return null;
    return this.devisRepo.find({ where: { user }, relations: ['user', 'cahierDesCharges'] });
  }

  async acceptDevis(id: number): Promise<Devis> {
  const devis = await this.devisRepo.findOne({
    where: { id },
    relations: ['user'], // pour inclure le user si nécessaire
  });

  if (!devis) throw new NotFoundException("Ce devis n'existe pas");

  devis.etat = EtatDevis.Accepte;
  const updatedDevis = await this.devisRepo.save(devis);

  await this.notificationsService.notifyResponsablesByRole(
    Role.RESPONSABLE_INDUSTRIALISATION,
    'Devis accepté',
    `Le devis soumis par ${devis.user?.username ?? 'un utilisateur'} a été accepté`,
    {
      devisId: updatedDevis.id,
      userId: devis.user?.id,
      username: devis.user?.username,
    },
  );

  return updatedDevis;
}


  async refuseDevis(id: number, commentaire: string): Promise<Devis> {
  const devis = await this.devisRepo.findOne({
    where: { id },
    relations: ['user'], // pour accéder au user
  });

  if (!devis) throw new NotFoundException("Ce devis n'existe pas");

  devis.etat = EtatDevis.Refuse;
  devis.commentaire = commentaire;
  const updatedDevis = await this.devisRepo.save(devis);

  await this.notificationsService.notifyResponsablesByRole(
    Role.RESPONSABLE_INDUSTRIALISATION,
    'Devis refusé',
    `Le devis soumis par ${devis.user?.username ?? 'un utilisateur'} a été refusé`,
    {
      devisId: updatedDevis.id,
      userId: devis.user?.id,
      username: devis.user?.username,
      commentaire,
    },
  );

  return updatedDevis;
}


  async getDevisById(id: number): Promise<Devis> {
  const devis = await this.devisRepo.findOne({
    where: { id },
    relations: ['user', 'user.partner', 'cahierDesCharges', 'cahierDesCharges.user']
  });
  if (!devis) throw new NotFoundException("Ce Devis n'existe pas");
  return devis;
}


  async archiver(id: number): Promise<Devis> {
    const devis = await this.devisRepo.findOne({ where: { id } });
    if (!devis) throw new NotFoundException("Ce devis n'existe pas");
    devis.archive = true;
    return this.devisRepo.save(devis);
  }

  async restorer(id: number): Promise<Devis> {
    const devis = await this.devisRepo.findOne({ where: { id } });
    if (!devis) throw new NotFoundException("Ce devis n'existe pas");
    devis.archive = false;
    return this.devisRepo.save(devis);
  }

  async archiverU(id: number): Promise<Devis> {
    const devis = await this.devisRepo.findOne({ where: { id } });
    if (!devis) throw new NotFoundException("Ce devis n'existe pas");
    devis.archiveU = true;
    return this.devisRepo.save(devis);
  }

  async restorerU(id: number): Promise<Devis> {
    const devis = await this.devisRepo.findOne({ where: { id } });
    if (!devis) throw new NotFoundException("Ce devis n'existe pas");
    devis.archiveU = false;
    return this.devisRepo.save(devis);
  }

  async deleteDevis(id: number): Promise<void> {
    await this.devisRepo.delete(id);
  }

  async startNegociation(id: number, commentaire?: string): Promise<Devis> {
  const devis = await this.devisRepo.findOne({ where: { id }, relations: ['user'] });
  if (!devis) throw new NotFoundException("Ce devis n'existe pas");

  // On peut ajouter des règles métier ici, exemple refusé ou accepté => interdit la négociation
  if (devis.etat === EtatDevis.Accepte) {
    throw new BadRequestException("Un devis accepté ne peut pas être mis en négociation");
  }
  if (devis.etat === EtatDevis.Refuse) {
    throw new BadRequestException("Un devis refusé ne peut pas être mis en négociation");
  }

  devis.etat = EtatDevis.Negociation;

  if (commentaire) {
    // Vous pouvez stocker ce commentaire dans une colonne dédiée ou dans commentaire général
    devis.commentaire = commentaire;
  }

  const updatedDevis = await this.devisRepo.save(devis);

  await this.notificationsService.notifyResponsablesByRole(
    Role.RESPONSABLE_INDUSTRIALISATION,
    'Début de négociation sur un devis',
    `Le devis soumis par ${devis.user?.username ?? 'un utilisateur'} est en négociation.`,
    {
      devisId: updatedDevis.id,
      userId: devis.user?.id,
      username: devis.user?.username,
    },
  );

  return updatedDevis;
}

}
