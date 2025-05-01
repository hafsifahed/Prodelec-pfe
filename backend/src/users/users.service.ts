import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { User } from './entities/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Create a new user with hashed password.
   * @param dto CreateUserDto containing user data
   * @returns Created user without password field
   */
  async create(dto: CreateUserDto): Promise<User> {
    const { username, password, firstName, lastName, email } = dto;

    // Generate salt and hash password securely
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user entity instance
    const user = this.usersRepository.create({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      email,
      accountStatus: 'inactive', // default status, adjust if needed
    });

    // Save user to DB
    const newUser = await this.usersRepository.save(user);

    // Remove password before returning user object
    delete newUser.password;

    return newUser;
  }

  /**
   * Find multiple users with optional filtering.
   * @param dto FindUsersDto with filter options (e.g. username, email)
   * @returns Array of users without passwords
   */
  async findMany(dto: FindUsersDto): Promise<User[]> {
    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    // Example filters (expand as needed)
    if (dto.username) {
      queryBuilder.andWhere('user.username LIKE :username', { username: `%${dto.username}%` });
    }
    if (dto.email) {
      queryBuilder.andWhere('user.email LIKE :email', { email: `%${dto.email}%` });
    }
    if (dto.accountStatus) {
      queryBuilder.andWhere('user.accountStatus = :status', { status: dto.accountStatus });
    }

    // Select fields explicitly, exclude password
    queryBuilder.select([
      'user.id',
      'user.username',
      'user.firstName',
      'user.lastName',
      'user.email',
      'user.accountStatus',
      'user.createdAt',
      'user.updatedAt',
    ]);

    return queryBuilder.getMany();
  }

  /**
   * Find a single user by username.
   * @param username The username to find
   * @param selectSecrets Whether to include password in the result
   * @returns User or undefined
   */
  async findOne(
    username: string,
    selectSecrets: boolean = false,
  ): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { username },
      select: selectSecrets
        ? ['id', 'username', 'firstName', 'lastName', 'email', 'accountStatus', 'password']
        : ['id', 'username', 'firstName', 'lastName', 'email', 'accountStatus'],
    });
  }
}
