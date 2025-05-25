import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsService } from '../notifications/notifications.service';
import { User } from '../users/entities/users.entity';
import { CreateAvisDto } from './dto/create-avis.dto';
import { UpdateAvisDto } from './dto/update-avis.dto';
import { Avis } from './entities/avis.entity';

@Injectable()
export class AvisService {
  constructor(
    @InjectRepository(Avis)
    private avisRepository: Repository<Avis>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
        private notificationsService: NotificationsService,



  ) {}

  async create(createAvisDto: CreateAvisDto): Promise<Avis> {
  const user = await this.userRepository.findOneBy({ id: createAvisDto.userId });
  if (!user) throw new NotFoundException('User not found');

  const avis = this.avisRepository.create({
    ...createAvisDto,
    user,
  });
  const savedAvis = await this.avisRepository.save(avis);

  // Notifier tous les admins
  await this.notificationsService.notifyAdmins(
    'Nouvel avis soumis',
    { avisId: savedAvis.id }
  );

  return savedAvis;
}




  findAll(): Promise<Avis[]> {
    return this.avisRepository.find({ relations: ['user'] });
  }

  findOne(id: number): Promise<Avis> {
    return this.avisRepository.findOne({ 
      where: { id },
      relations: ['user']
    });
  }

  async update(id: number, updateAvisDto: UpdateAvisDto): Promise<Avis> {
    const avis = await this.avisRepository.preload({
      id,
      ...updateAvisDto
    });
    if (!avis) throw new NotFoundException();
    return this.avisRepository.save(avis);
  }

  async remove(id: number): Promise<void> {
    await this.avisRepository.delete(id);
  }

  async findByUser(userId: number): Promise<Avis[]> {
    return this.avisRepository.find({
      where: { user: { id: userId } },
      relations: ['user']
    });
  }
}
