// src/cdc/cahier-des-charges.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/users.entity';
import { CreateCahierDesChargesDto } from './dto/create-cahier-des-charge.dto';
import { CahierDesCharges } from './entities/cahier-des-charge.entity';

@Injectable()
export class CahierDesChargesService {
  constructor(
    @InjectRepository(CahierDesCharges)
    private readonly repository: Repository<CahierDesCharges>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

   async saveCahierDesCharges(dto: CreateCahierDesChargesDto): Promise<CahierDesCharges> {
  const user = await this.userRepository.findOneBy({ id: dto.userId });
  if (!user) throw new NotFoundException('User not found');

  const cdc = this.repository.create({
    ...dto,
    user,
  });
  delete (cdc as any).userId;

  return this.repository.save(cdc);
}



  getAllCahierDesCharges(): Promise<CahierDesCharges[]> {
    return this.repository.find();
  }

  async getCahierDesChargesById(id: number): Promise<CahierDesCharges> {
    const cdc = await this.repository.findOne({ where: { id } });
    if (!cdc) throw new NotFoundException("Ce Cahier n'existe pas");
    return cdc;
  }

  async deleteCahierDesCharges(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  getCahierDesChargesByUser(user: User): Promise<CahierDesCharges[]> | null {
    if (!user) return null;
    return this.repository.find({ where: { user } });
  }

  updateCahierDesCharges(updatedCdc: CahierDesCharges): Promise<CahierDesCharges> {
    return this.repository.save(updatedCdc);
  }

  async acceptCahierDesCharges(id: number): Promise<CahierDesCharges> {
    const cdc = await this.repository.findOne({ where: { id } });
    if (!cdc) throw new NotFoundException("Ce Cahier n'existe pas");
    cdc.etat = 'Accepté';
    return this.repository.save(cdc);
  }

  async refuseCahierDesCharges(id: number, commentaire: string): Promise<CahierDesCharges> {
    const cdc = await this.repository.findOne({ where: { id } });
    if (!cdc) throw new NotFoundException("Ce Cahier n'existe pas");
    cdc.etat = 'Refusé';
    cdc.commentaire = commentaire;
    return this.repository.save(cdc);
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
