import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/users.entity';
import { AccountStatus } from '../users/enums/account-status.enum';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    // Seed roles
    const adminRole = await this.roleRepository.findOne({ where: { name: 'admin' } });
    if (!adminRole) {
      await this.roleRepository.save(this.roleRepository.create({ name: 'admin', permissions: [] }));
    }
    const userRole = await this.roleRepository.findOne({ where: { name: 'user' } });
    if (!userRole) {
      await this.roleRepository.save(this.roleRepository.create({ name: 'user', permissions: [] }));
    }

    // Seed admin user
    const adminEmail = 'aaaaaa@gmail.com';
    const existingAdmin = await this.userRepository.findOne({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const role = await this.roleRepository.findOne({ where: { name: 'admin' } });
      const hashedPassword = await bcrypt.hash('aaaaaaaaa', await bcrypt.genSalt());
      const adminUser = this.userRepository.create({
        username: 'admin',
        email: adminEmail,
        firstName: 'Admin',
        lastName: 'User',
        password: hashedPassword,
        role,
        accountStatus: AccountStatus.ACTIVE,
      });
      await this.userRepository.save(adminUser);
    }
  }
}
