import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/users.entity';
import { CreateUserSessionDto } from './dto/create-user-session.dto';
import { UpdateUserSessionDto } from './dto/update-user-session.dto';
import { UserSession } from './entities/user-session.entity';

@Injectable()
export class UserSessionService {
  constructor(
    @InjectRepository(UserSession)
    private readonly sessionRepo: Repository<UserSession>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createSession(dto: CreateUserSessionDto): Promise<UserSession> {
    let user: User = null;
    if (dto.userId) {
      user = await this.userRepo.findOneBy({ id: dto.userId });
    }
    const session = this.sessionRepo.create({
      usermail: dto.usermail,
      ipAddress: dto.ipAddress,
      sessionStart: new Date(),
      user,
    });
    return this.sessionRepo.save(session);
  }

  async endSession(id: number): Promise<boolean> {
    const session = await this.sessionRepo.findOneBy({ id });
    if (!session) return false;
    session.sessionEnd = new Date();
    await this.sessionRepo.save(session);
    return true;
  }

  async updateSession(dto: UpdateUserSessionDto): Promise<UserSession> {
    const session = await this.sessionRepo.findOneBy({ id: dto.id });
    if (!session) return null;
    if (dto.sessionEnd) session.sessionEnd = dto.sessionEnd;
    if (dto.ipAddress) session.ipAddress = dto.ipAddress;
    return this.sessionRepo.save(session);
  }

  async getAllSessions(): Promise<UserSession[]> {
    return this.sessionRepo.find({ relations: ['user'] });
  }

  async getSessionById(id: number): Promise<UserSession> {
    return this.sessionRepo.findOne({ where: { id }, relations: ['user'] });
  }

  async isSessionActive(id: number): Promise<boolean> {
    const session = await this.sessionRepo.findOneBy({ id });
    return !!session && session.sessionEnd == null;
  }

  async deleteSession(id: number): Promise<boolean> {
    const result = await this.sessionRepo.delete(id);
    return result.affected > 0;
  }

  async countActiveSessionsByUserId(userId: number): Promise<number> {
  return this.sessionRepo
    .createQueryBuilder('session')
    .innerJoin('session.user', 'user') // Jointure explicite
    .where('user.id = :userId', { userId })
    .andWhere('session.sessionEnd IS NULL')
    .getCount();
}

async findActiveSessionsByUserId(userId: number): Promise<UserSession[]> {
  return this.sessionRepo.find({
    where: { user: { id: userId }, sessionEnd: null }, // sessionEnd null = active
    order: { sessionStart: 'ASC' },
  });
}



}
