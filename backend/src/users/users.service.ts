import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Role } from '../roles/entities/role.entity'; // Import Role entity
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { User } from './entities/users.entity';
import { AccountStatus } from './enums/account-status.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>, // Inject Role repository
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
      username,
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

  async findMany(dto: FindUsersDto): Promise<User[]> {
    const queryBuilder = this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role'); // join role relation

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
      // add other role fields if needed
    ]);

    return queryBuilder.getMany();
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
      ]);
    } else {
      queryBuilder.addSelect('user.password');
      //queryBuilder.addSelect('user.permissions');  if permissions are on user
    }

    return queryBuilder.getOne();
  }

  async changePassword(userId: number, dto: ChangePasswordDto): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordMatches = await bcrypt.compare(dto.currentPassword, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt();
    const hashedNewPassword = await bcrypt.hash(dto.newPassword, salt);

    await this.usersRepository.update(userId, { password: hashedNewPassword });
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

  
}
