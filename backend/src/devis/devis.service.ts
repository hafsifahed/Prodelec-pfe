import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CahierDesCharges } from '../cahier-des-charges/entities/cahier-des-charge.entity';
import { User } from '../users/entities/users.entity';
import { Devis } from './entities/devi.entity';

@Injectable()
export class DevisService {
  constructor(
    @InjectRepository(Devis)
    private readonly devisRepo: Repository<Devis>,
    @InjectRepository(CahierDesCharges)
    private readonly cdcRepo: Repository<CahierDesCharges>,
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
    etat: 'En attente',
  });

  return this.devisRepo.save(devis);
}


  findAll(): Promise<Devis[]> {
    return this.devisRepo.find({ relations: ['user', 'cahierDesCharges'] });
  }

  findByUser(user: User): Promise<Devis[]> {
    if (!user) return null;
    return this.devisRepo.find({ where: { user }, relations: ['user', 'cahierDesCharges'] });
  }

  async acceptDevis(id: number): Promise<Devis> {
    const devis = await this.devisRepo.findOne({ where: { id } });
    if (!devis) throw new NotFoundException("Ce Cahier n'existe pas");
    devis.etat = 'Accepté';
    return this.devisRepo.save(devis);
  }

  async refuseDevis(id: number, commentaire: string): Promise<Devis> {
    const devis = await this.devisRepo.findOne({ where: { id } });
    if (!devis) throw new NotFoundException("Ce Cahier n'existe pas");
    devis.etat = 'Refusé';
    devis.commentaire = commentaire;
    return this.devisRepo.save(devis);
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
}
