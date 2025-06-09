import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Partner } from '../partners/entities/partner.entity';
import { Role } from '../roles/entities/role.entity'; // Import Role entity
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { UpdateUserFullDto } from './dto/update-user-full.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/users.entity';
import { AccountStatus } from './enums/account-status.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>, 
    
    @InjectRepository(Partner)
    private readonly partnersRepository: Repository<Partner>, 
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const { username, password, firstName, lastName, email, roleId } = dto;

    // Find the Role entity by roleId
    const role = await this.rolesRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`Role with id ${roleId} not found`);
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.usersRepository.create({
      username: email.split('@')[0],
      password: hashedPassword,
      firstName,
      lastName,
      email,
      role, // assign Role entity here
      accountStatus: AccountStatus.INACTIVE,
    });

    const newUser = await this.usersRepository.save(user);
    delete newUser.password;
    return newUser;
  }

  async createBy(dto: CreateUserDto & { partnerId?: number }): Promise<User> {
    const { username, password, firstName, lastName, email, roleId, partnerId } = dto;
  
    const role = await this.rolesRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`Role with id ${roleId} not found`);
    }
  
    let partner = null;
    if (partnerId) {
      partner = await this.partnersRepository.findOne({ where: { id: partnerId } });
      if (!partner) {
        throw new NotFoundException(`Partner with id ${partnerId} not found`);
      }
    }
  
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
  
    const user = this.usersRepository.create({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      email,
      role,
      partner, // assign partner entity if exists
      accountStatus: AccountStatus.INACTIVE,
    });
  
    const newUser = await this.usersRepository.save(user);
    delete newUser.password;
    return newUser;
  }
  

  async findMany(dto: FindUsersDto): Promise<User[]> {
    const queryBuilder = this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')      // join role relation
      .leftJoinAndSelect('user.partner', 'partner'); // join partner relation
  
    if (dto.username) {
      queryBuilder.andWhere('user.username LIKE :username', { username: `%${dto.username}%` });
    }
    if (dto.email) {
      queryBuilder.andWhere('user.email LIKE :email', { email: `%${dto.email}%` });
    }
    if (dto.accountStatus) {
      queryBuilder.andWhere('user.accountStatus = :status', { status: dto.accountStatus });
    }
    if (dto.roleId) {
      queryBuilder.andWhere('role.id = :roleId', { roleId: dto.roleId });
    }
  
    queryBuilder.select([
      'user.id',
      'user.username',
      'user.firstName',
      'user.lastName',
      'user.email',
      'user.accountStatus',
      'user.createdAt',
      'user.updatedAt',
      'role.id',
      'role.name',
      'partner.id',     // include partner id
      'partner.name',   // include partner name
    ]);
  
    return queryBuilder.getMany();
  }

  async findAdmins(): Promise<User[]> {
  return this.usersRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.role', 'role')
    .where('role.name = :roleName', { roleName: 'ADMIN' })
    .getMany();
}

  

  async findOne(username: string, selectSecrets = false): Promise<User | undefined> {
    const queryBuilder = this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.username = :username', { username });

    if (!selectSecrets) {
      queryBuilder.select([
        'user.id',
        'user.username',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.accountStatus',
        'user.createdAt',
        'user.updatedAt',
        'role.id',
        'role.name',
        'role.permissions'

      ]);
    } else {
      queryBuilder.addSelect('user.password');
      //queryBuilder.addSelect('user.permissions');  if permissions are on user
    }

    return queryBuilder.getOne();
  }

  async findOneById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role', 'partner'], // load related entities if needed
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }
  

  async changePassword(userId: number, dto: ChangePasswordDto): Promise<void> {
    // Recherche l'utilisateur par son ID
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Vérifie si le mot de passe actuel correspond
    const passwordMatches = await bcrypt.compare(dto.currentPassword, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Crée un mot de passe haché pour le nouveau mot de passe
    const salt = await bcrypt.genSalt();
    const hashedNewPassword = await bcrypt.hash(dto.newPassword, salt);

    // Mise à jour du mot de passe dans la base de données
    user.password = hashedNewPassword;  // Mise à jour du mot de passe directement sur l'entité
    await this.usersRepository.save(user);  // Utilise save au lieu de update
  }

  async updateRole(userId: number, roleId: number): Promise<User> {
    const role = await this.rolesRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    await this.usersRepository.update(userId, { role });

    const updatedUser = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async getProfile(userId: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['role','partner'], // eager load role and permissions
      select: [
        'id',
        'username',
        'firstName',
        'lastName',
        'email',
        'accountStatus',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getNameProfile(userId: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['role'], // eager load role and permissions
      select: [
        'id',
        'username',
        'accountStatus',

      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // Update User Details
  async updateUser(userId: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.firstName) user.firstName = dto.firstName;
    if (dto.lastName) user.lastName = dto.lastName;
    if (dto.email) user.email = dto.email;

    return this.usersRepository.save(user);
  }

  async updateUserFull(userId: number, dto: UpdateUserFullDto): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
  
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
  
    // Update simple fields
    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.accountStatus !== undefined) user.accountStatus = dto.accountStatus;
  
    // Update role if provided
    if (dto.roleId !== undefined) {
      const role = await this.rolesRepository.findOne({ where: { id: dto.roleId } });
      if (!role) throw new NotFoundException(`Role with id ${dto.roleId} not found`);
      user.role = role;
    }
  
    // Update partner if provided
    if (dto.partnerId !== undefined) {
      const partner = await this.partnersRepository.findOne({ where: { id: dto.partnerId } });
      if (!partner) throw new NotFoundException(`Partner with id ${dto.partnerId} not found`);
      user.partner = partner;
    }
  
    return this.usersRepository.save(user);
  }
  

  // Change Account Status
  async updateAccountStatus(userId: number, status: AccountStatus): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!Object.values(AccountStatus).includes(status)) {
      throw new BadRequestException('Invalid account status');
    }

    user.accountStatus = status;
    return this.usersRepository.save(user);
  }

  // Search Users by Keyword
  async searchUsers(keyword: string): Promise<User[]> {
    if (!keyword || keyword.trim().length < 2) {
      throw new BadRequestException('Search keyword must be at least 2 characters');
    }

    const searchTerm = `%${keyword.toLowerCase()}%`;

    return this.usersRepository
      .createQueryBuilder('user')
      .where(
        'LOWER(user.firstName) LIKE :searchTerm OR ' +
        'LOWER(user.lastName) LIKE :searchTerm OR ' +
        'LOWER(user.username) LIKE :searchTerm OR ' +
        'LOWER(user.email) LIKE :searchTerm',
        { searchTerm }
      )
      .leftJoinAndSelect('user.role', 'role')
      .select([
        'user.id',
        'user.username',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.accountStatus',
        'user.createdAt',
        'user.updatedAt',
        'role.id',
        'role.name'
      ])
      .getMany();
  }

  async setPassword(userId: number, dto: SetPasswordDto): Promise<void> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(dto.newPassword, salt);
    
    await this.usersRepository.save(user);
  }

  async deleteUser(userId: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    await this.usersRepository.remove(user);
  }

   async getUserAndSessionStats(): Promise<{
  totalEmployees: number;
  connectedEmployees: number;
  totalClients: number;
  connectedClients: number;
}> {
  const clientPattern = '%client%';

  const totalEmployees = await this.usersRepository
    .createQueryBuilder('user')
    .innerJoin('user.role', 'role')
    .where('LOWER(role.name) NOT LIKE :clientPattern', { clientPattern })
    .getCount();

  const connectedEmployees = await this.usersRepository
    .createQueryBuilder('user')
    .innerJoin('user.role', 'role')
    .innerJoin('user.sessions', 'session')
    .where('LOWER(role.name) NOT LIKE :clientPattern', { clientPattern })
    .andWhere('session.sessionEnd IS NULL')
    .getCount();

  const totalClients = await this.usersRepository
    .createQueryBuilder('user')
    .innerJoin('user.role', 'role')
    .where('LOWER(role.name) LIKE :clientPattern', { clientPattern })
    .getCount();

  const connectedClients = await this.usersRepository
    .createQueryBuilder('user')
    .innerJoin('user.role', 'role')
    .innerJoin('user.sessions', 'session')
    .where('LOWER(role.name) LIKE :clientPattern', { clientPattern })
    .andWhere('session.sessionEnd IS NULL')
    .getCount();

  return {
    totalEmployees,
    connectedEmployees,
    totalClients,
    connectedClients,
  };
}



   findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async getClientRoles(): Promise<Role[]> {
    return this.rolesRepository
      .createQueryBuilder('role')
      .where('UPPER(role.name) LIKE :prefix', { prefix: 'CLIENT%' })
      .getMany();
  }


  async getWorkerRoles(): Promise<Role[]> {
    return this.rolesRepository
      .createQueryBuilder('role')
      .where('UPPER(role.name) NOT LIKE :prefix', { prefix: 'CLIENT%' })
      .getMany();
  }

  async findWorkers(): Promise<User[]> {
  return this.usersRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.role', 'role')
    .leftJoinAndSelect('user.partner', 'partner') // si tu veux inclure les infos du partenaire
    .where('UPPER(role.name) NOT LIKE :prefix', { prefix: 'CLIENT%' })
    .select([
      'user.id',
      'user.username',
      'user.firstName',
      'user.lastName',
      'user.email',
      'user.accountStatus',
      'user.createdAt',
      'user.updatedAt',
      'role.id',
      'role.name',
      'partner.id',
      'partner.name'
    ])
    .getMany();
}

  
  /*method directly
   async deleteUser(userId: number): Promise<void> {
    const result = await this.usersRepository.delete(userId);
    if (result.affected === 0) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
  }*/
  
  
}
