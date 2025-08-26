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

    // Récupérer l'utilisateur à partir de l'id
    console.log('yser avis')
    const user = await this.userRepository.findOneBy({ id: createAvisDto.user.id });
if (!user) throw new NotFoundException('User not found');

const avis = this.avisRepository.create({
  ...createAvisDto, // ne doit PAS contenir un champ "user"
  user,             // c'est ici que tu lies l'utilisateur
});


    // Sauvegarder l'avis en base
    const savedAvis = await this.avisRepository.save(avis);

    // Notifier tous les admins
    await this.notificationsService.notifyAdmins(
      'Nouvel avis soumis',
      `Par ${user.username}`,
      { avisId: savedAvis.id, userId: user.id ,username:user.username}
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

  async findByPartner(partnerId: number): Promise<Avis[]> {
  return this.avisRepository.createQueryBuilder('avis')
    .leftJoinAndSelect('avis.user', 'user')
    .leftJoin('user.partner', 'partner')
    .where('partner.id = :partnerId', { partnerId })
    .getMany();
}

async hasOldAvis(userId: number): Promise<boolean> {
  // Vérifier que l'utilisateur existe
  const user = await this.userRepository.findOneBy({ id: userId });
  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Calculer la date seuil : il y a 3 mois
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  // Récupérer le dernier avis de l'utilisateur, trié par date création descendante (le plus récent)
  const lastAvis = await this.avisRepository
    .createQueryBuilder('avis')
    .where('avis.userId = :userId', { userId })
    .orderBy('avis.createdAt', 'DESC')
    .getOne();

  // Si pas d'avis, retourner true (car jamais fait d'avis)
  if (!lastAvis) {
    return true;
  }

  // Renvoie true si la date du dernier avis est antérieure à la date il y a 3 mois
  return lastAvis.createdAt < threeMonthsAgo;
}


}
