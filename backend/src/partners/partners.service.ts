import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PartnerStatus } from '../project/enum/partner-status.enum';
import { User } from '../users/entities/users.entity';
import { AccountStatus } from '../users/enums/account-status.enum';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { Partner } from './entities/partner.entity';

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(Partner)
    private partnerRepository: Repository<Partner>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
      private dataSource: DataSource,

  ) {}

  findAll(): Promise<Partner[]> {
    return this.partnerRepository.find({ relations: ['users'] });
  }

  findOne(id: number): Promise<Partner> {
    return this.partnerRepository.findOne({ where: { id }, relations: ['users'] });
  }

  async create(createPartnerDto: CreatePartnerDto): Promise<Partner> {
    const partner = this.partnerRepository.create(createPartnerDto);
    return this.partnerRepository.save(partner);
  }

  async update(id: number, updatePartnerDto: UpdatePartnerDto): Promise<Partner> {
    const partner = await this.partnerRepository.findOneBy({ id });
    if (!partner) throw new NotFoundException();
    Object.assign(partner, updatePartnerDto);
    return this.partnerRepository.save(partner);
  }

  async remove(id: number): Promise<void> {
    await this.partnerRepository.delete(id);
  }

  // Custom methods
  async getPartnerByUserId(userId: number): Promise<Partner> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['partner'],
    });
    return user?.partner;
  }

  async getUsersByPartnerId(partnerId: number): Promise<User[]> {
    return this.userRepository.find({ where: { partner: { id: partnerId } } });
  }

  
  async inactivatePartner(partnerId: number): Promise<Partner> {
  return await this.dataSource.transaction(async manager => {
    const partner = await manager.findOne(Partner, {
      where: { id: partnerId },
      relations: ['users'],
    });

    if (!partner) {
      throw new NotFoundException(`Partner with id ${partnerId} not found`);
    }

    partner.partnerStatus = PartnerStatus.INACTIVE;

    if (partner.users && partner.users.length > 0) {
      for (const user of partner.users) {
        user.accountStatus = AccountStatus.INACTIVE;
      }
      await manager.save(partner.users);
    }

    return await manager.save(partner);
  });
}

async activatePartner(partnerId: number): Promise<Partner> {
  const partner = await this.partnerRepository.findOne({
    where: { id: partnerId },
    relations: ['users'],
  });

  if (!partner) {
    throw new NotFoundException(`Partner with id ${partnerId} not found`);
  }

  partner.partnerStatus = PartnerStatus.ACTIVE;

  if (partner.users && partner.users.length > 0) {
    for (const user of partner.users) {
      user.accountStatus = AccountStatus.ACTIVE;
    }
    await this.userRepository.save(partner.users);
  }

  return this.partnerRepository.save(partner);
}
}
