// src/reclamation/reclamation.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/users.entity';
import { CreateReclamationDto } from './dto/create-reclamation.dto';
import { UpdateReclamationDto } from './dto/update-reclamation.dto';
import { Reclamation } from './entities/reclamation.entity';

@Injectable()
export class ReclamationService {
  constructor(
    @InjectRepository(Reclamation)
    private readonly reclamationRepo: Repository<Reclamation>,
  ) {}

  async create(createDto: CreateReclamationDto, user: User): Promise<Reclamation> {
    const reclamation = this.reclamationRepo.create({
      ...createDto,
      user,  // assign user entity here
    });
    return this.reclamationRepo.save(reclamation);
  }

  async update(id: number, updateReclamationDto: UpdateReclamationDto): Promise<Reclamation> {
    const existing = await this.findOne(id);
    const updated = this.reclamationRepo.merge(existing, updateReclamationDto);
    return this.reclamationRepo.save(updated);
  }

  async findAll(): Promise<Reclamation[]> {
    return this.reclamationRepo
      .createQueryBuilder('reclamation')
      .leftJoinAndSelect('reclamation.user', 'user')
      .leftJoinAndSelect('user.partner', 'partner')
      .select([
        // List all reclamation columns explicitly:
        'reclamation.id_reclamation',
        'reclamation.description',
        'reclamation.dateDeCreation',
        'reclamation.PieceJointe',
        'reclamation.status',
        'reclamation.Reponse',
        'reclamation.type_de_defaut',
        'reclamation.archive',
        'reclamation.archiveU',
  
        // User columns:
        'user.id',
        'user.username',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.accountStatus',
  
        // Partner columns:
        'partner.id',
        'partner.name', // adjust as needed
      ])
      .getMany();
  }
  /* get all columns of partner and user
  async findAll(): Promise<Reclamation[]> {
  return this.reclamationRepo
    .createQueryBuilder('reclamation')
    .leftJoinAndSelect('reclamation.user', 'user')
    .leftJoinAndSelect('user.partner', 'partner')
    .getMany();
}
*/
  
async findOne(id: number): Promise<Reclamation> {
  const reclamation = await this.reclamationRepo
    .createQueryBuilder('reclamation')
    .leftJoinAndSelect('reclamation.user', 'user')
    .leftJoinAndSelect('user.partner', 'partner')
    .select([
      // Reclamation columns
      'reclamation.id_reclamation',
      'reclamation.description',
      'reclamation.dateDeCreation',
      'reclamation.PieceJointe',
      'reclamation.status',
      'reclamation.Reponse',
      'reclamation.type_de_defaut',
      'reclamation.archive',
      'reclamation.archiveU',

      // User columns
      'user.id',
      'user.username',
      'user.firstName',
      'user.lastName',
      'user.email',
      'user.accountStatus',

      // Partner columns
      'partner.id',
      'partner.name', // Adjust fields as per your Partner entity
    ])
    .where('reclamation.id_reclamation = :id', { id })
    .getOne();

  if (!reclamation) {
    throw new NotFoundException('Reclamation not found');
  }

  return reclamation;
}


  /*async findOne(id: number): Promise<Reclamation> {
    const reclamation = await this.reclamationRepo
      .createQueryBuilder('reclamation')
      .leftJoinAndSelect('reclamation.user', 'user')
      .leftJoinAndSelect('user.partner', 'partner')  // ensure this join exists
      .where('reclamation.id_reclamation = :id', { id })
      .getOne();
  
    if (!reclamation) {
      throw new NotFoundException('Reclamation not found');
    }
    return reclamation;
  }*/
  
  
  

  async findByUser(userId: number): Promise<Reclamation[]> {
    return this.reclamationRepo.find({ where: { user: { id: userId } } });
  }

  async delete(id: number): Promise<void> {
    await this.reclamationRepo.delete(id);
  }

  async archive(id: number): Promise<Reclamation> {
    const reclamation = await this.findOne(id);
    reclamation.archive = true;
    return this.reclamationRepo.save(reclamation);
  }

  async restore(id: number): Promise<Reclamation> {
    const reclamation = await this.findOne(id);
    reclamation.archive = false;
    return this.reclamationRepo.save(reclamation);
  }

  async archiveU(id: number): Promise<Reclamation> {
    const reclamation = await this.findOne(id);
    reclamation.archiveU = true;
    return this.reclamationRepo.save(reclamation);
  }

  async restoreU(id: number): Promise<Reclamation> {
    const reclamation = await this.findOne(id);
    reclamation.archiveU = false;
    return this.reclamationRepo.save(reclamation);
  }

  async processReclamation(id: number, response: string): Promise<Reclamation> {
    const reclamation = await this.findOne(id);
    reclamation.status = 'Traité';
    reclamation.Reponse = response;
    return this.reclamationRepo.save(reclamation);
  }
}
