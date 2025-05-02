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
    // Seed roles (admin, user, rh)
    const rolesToSeed = ['admin', 'user', 'rh'];

    for (const roleName of rolesToSeed) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleName },
      });

      if (!existingRole) {
        await this.roleRepository.save(
          this.roleRepository.create({
            name: roleName,
            permissions: [],
          }),
        );
      }
    }

    // Seed admin user
    const adminEmail = 'aaaaaa@gmail.com';
    const existingAdmin = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const adminRole = await this.roleRepository.findOne({
        where: { name: 'admin' },
      });

      const hashedPassword = await bcrypt.hash('aaaaaaaaa', await bcrypt.genSalt());

      const adminUser = this.userRepository.create({
        username: 'admin',
        email: adminEmail,
        firstName: 'Admin',
        lastName: 'User',
        password: hashedPassword,
        role: adminRole,
        accountStatus: AccountStatus.ACTIVE,
      });

      await this.userRepository.save(adminUser);
    }

    // Seed rh user
    const rhEmail = 'rh@example.com';
    const existingRh = await this.userRepository.findOne({
      where: { email: rhEmail },
    });

    if (!existingRh) {
      const rhRole = await this.roleRepository.findOne({
        where: { name: 'rh' },
      });

      const hashedPassword = await bcrypt.hash('aaaaaaaaa', await bcrypt.genSalt());

      const rhUser = this.userRepository.create({
        username: 'rh',
        email: rhEmail,
        firstName: 'RH',
        lastName: 'User',
        password: hashedPassword,
        role: rhRole,
        accountStatus: AccountStatus.ACTIVE,
      });

      await this.userRepository.save(rhUser);
    }
  }
}
