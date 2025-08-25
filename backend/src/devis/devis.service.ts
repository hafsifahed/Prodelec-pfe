import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CahierDesCharges, EtatCahier } from '../cahier-des-charges/entities/cahier-des-charge.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { Role } from '../roles/enums/roles.enum';
import { User } from '../users/entities/users.entity';
import { WorkflowPhase } from '../workflow-discussion/entities/workflow-discussion.entity';
import { WorkflowDiscussionService } from '../workflow-discussion/workflow-discussion.service';
import { Devis, EtatDevis } from './entities/devi.entity';

@Injectable()
export class DevisService {
  constructor(
    @InjectRepository(Devis)
    private readonly devisRepo: Repository<Devis>,
    @InjectRepository(CahierDesCharges)
    private readonly cdcRepo: Repository<CahierDesCharges>,
    private notificationsService: NotificationsService,
        private readonly discussionService:WorkflowDiscussionService,
        
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async saveDevis(cdcId: number, pieceJointe: string, numdevis: string): Promise<Devis> {
    const cdc = await this.cdcRepo.findOne({ 
      where: { id: cdcId }, 
      relations: ['user'] 
    });
    
    if (!cdc) throw new NotFoundException('Cahier des Charges not found');

    const devis = this.devisRepo.create({
      pieceJointe,
      numdevis,
      projet: cdc.titre,
      commentaire: '',
      user: cdc.user,
      cahierDesCharges: cdc,
      dateCreation: new Date(),
      etat: EtatDevis.EnAttente,
    });

    const savedDevis = await this.devisRepo.save(devis);

    cdc.etat = EtatCahier.Accepte;
    await this.cdcRepo.save(cdc);

    await this.notificationsService.createAndSendNotification(
      cdc.user,
      'Nouveau devis créé',
      `Un devis (#${numdevis}) a été créé pour le cahier des charges "${cdc.titre}". Le cahier des charges a été accepté.`,
      { devisId: savedDevis.id, cdcId: cdc.id }
    );

     await this.discussionService.transitionPhase(
    cdc.id, 
    { targetPhase: WorkflowPhase.DEVIS, targetEntityId: savedDevis.id }
  );

    return savedDevis;
  }

  async findAll(): Promise<Devis[]> {
  return this.devisRepo
    .createQueryBuilder('devis')
    .leftJoinAndSelect('devis.user', 'user')
    .leftJoinAndSelect('user.partner', 'partner')
    .leftJoinAndSelect('devis.cahierDesCharges', 'cdc')
    .orderBy(`
      CASE devis.etat
        WHEN '${EtatDevis.Negociation}' THEN 1
        WHEN '${EtatDevis.Accepte}' THEN 2
        WHEN '${EtatDevis.EnAttente}' THEN 3
        WHEN '${EtatDevis.Refuse}' THEN 4
        ELSE 5
      END
    `, 'ASC')
    .addOrderBy('devis.createdAt', 'DESC')
    .getMany();
}

/*findAll(): Promise<Devis[]> {
    return this.devisRepo.find({ 
      relations: ['user', 'cahierDesCharges'] 
    });
  }*/
  
  async findByUser(userId: number): Promise<Devis[] | null> {
        const user = await this.userRepository.findOneBy({ id: userId });

  if (!user) return null;

  return this.devisRepo
    .createQueryBuilder('devis')
    .leftJoinAndSelect('devis.user', 'user')
    .leftJoinAndSelect('devis.cahierDesCharges', 'cdc')
    .where('devis.userId = :userId', { userId: user.id })
    .orderBy(`
      CASE devis.etat
        WHEN '${EtatDevis.Negociation}' THEN 1
        WHEN '${EtatDevis.Accepte}' THEN 2
        WHEN '${EtatDevis.EnAttente}' THEN 3
        WHEN '${EtatDevis.Refuse}' THEN 4
        ELSE 5
      END
    `, 'ASC')
    .addOrderBy('devis.createdAt', 'DESC')
    .getMany();
}


  async acceptDevis(id: number): Promise<Devis> {
    const devis = await this.devisRepo.findOne({
      where: { id },
      relations: ['user','cahierDesCharges'],
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
console.log('devi : ',devis.cahierDesCharges)
    await this.discussionService.transitionPhase(
    devis.cahierDesCharges.id ,
    { targetPhase: WorkflowPhase.DEVIS, targetEntityId: updatedDevis.id }
  );

    return updatedDevis;
  }

  async refuseDevis(id: number, commentaire: string): Promise<Devis> {
    const devis = await this.devisRepo.findOne({
      where: { id },
      relations: ['user'],
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
    const devis = await this.devisRepo.findOne({ 
      where: { id }, 
      relations: ['user'] 
    });
    
    if (!devis) throw new NotFoundException("Ce devis n'existe pas");

    if (devis.etat === EtatDevis.Accepte) {
      throw new BadRequestException("Un devis accepté ne peut pas être mis en négociation");
    }
    
    if (devis.etat === EtatDevis.Refuse) {
      throw new BadRequestException("Un devis refusé ne peut pas être mis en négociation");
    }

    devis.etat = EtatDevis.Negociation;
    
    if (commentaire) {
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

  // Nouvelle méthode pour mettre à jour la pièce jointe
  async updatePieceJointe(id: number, pieceJointe: string): Promise<Devis> {
  const devis = await this.devisRepo.findOne({ where: { id }, relations: ['user'] }); // Ajout de la relation user
  
  if (!devis) {
    throw new NotFoundException("Ce devis n'existe pas");
  }

  // Vérifier que le devis est en état de négociation
  if (devis.etat !== EtatDevis.Negociation) {
    throw new BadRequestException("Seuls les devis en négociation peuvent être modifiés");
  }

  devis.pieceJointe = pieceJointe;
  devis.etat = EtatDevis.EnAttente;
  const updatedDevis = await this.devisRepo.save(devis);

  // Notification à l'utilisateur
  await this.notificationsService.createAndSendNotification(
    devis.user,
    'Mise à jour du devis pour négociation',
    `Le devis (#${devis.numdevis}) a été mis à jour avec une nouvelle pièce jointe pour sa négociation.`,
    { devisId: updatedDevis.id }
  );

  return updatedDevis;
}

async findAcceptedByCurrentUser(user: User): Promise<Devis[]> {
  if (!user) {
    throw new BadRequestException('Utilisateur non valide');
  }

  return this.devisRepo.find({
    where: {
      user: { id: user.id },
      etat: EtatDevis.Accepte
    },
    relations: ['user', 'cahierDesCharges']
  });
}

}