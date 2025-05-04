import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Role as RoleEntity } from '../roles/entities/role.entity';
import { Action } from '../roles/enums/action.enum';
import { Resource } from '../roles/enums/resource.enum';
import { Role as RoleEnum } from '../roles/enums/roles.enum';
import { User } from '../users/entities/users.entity';
import { AccountStatus } from '../users/enums/account-status.enum';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    // Define permission sets for resources
    const fullAccess = [Action.read, Action.create, Action.update, Action.delete];
    const readOnly = [Action.read];

    // Map each role to its permissions
    const rolePermissionsMap: Record<string, { resource: Resource; actions: Action[] }[]> = {
      [RoleEnum.ADMIN]: [
        { resource: Resource.users, actions: fullAccess },
        { resource: Resource.products, actions: fullAccess },
        // Add other resources full access for admin
      ],
      [RoleEnum.SUBADMIN]: [
        { resource: Resource.users, actions: [Action.read, Action.create, Action.update] },
        { resource: Resource.products, actions: [Action.read, Action.create, Action.update] },
        // Subadmin has no delete permission
      ],
      [RoleEnum.PROCESS_QUALITY]: [
        { resource: Resource.users, actions: readOnly },
        // Define process-specific resources and permissions here
      ],
      [RoleEnum.PROCESS_DESIGN]: [
        { resource: Resource.users, actions: readOnly },
      ],
      [RoleEnum.PROCESS_METHOD]: [
        { resource: Resource.users, actions: readOnly },
      ],
      [RoleEnum.PROCESS_PRODUCTION]: [
        { resource: Resource.users, actions: readOnly },
      ],
      [RoleEnum.PROCESS_LOGISTICS]: [
        { resource: Resource.users, actions: readOnly },
      ],
      [RoleEnum.PROCESS_DAF]: [
        { resource: Resource.users, actions: readOnly },
      ],
      [RoleEnum.PROCESS_RH]: [
        { resource: Resource.users, actions: readOnly },
      ],
      [RoleEnum.CLIENT_ADMIN]: [
        { resource: Resource.users, actions: fullAccess },
        // Client admin permissions here
      ],
      [RoleEnum.CLIENT_USER]: [
        { resource: Resource.users, actions: readOnly },
        // Client user limited permissions
      ],
    };

    // Loop through all roles in the Role enum
    for (const roleName of Object.values(RoleEnum)) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleName },
      });

      if (!existingRole) {
        const permissions = rolePermissionsMap[roleName] || [];
        await this.roleRepository.save(
          this.roleRepository.create({
            name: roleName,
            permissions,
          }),
        );
      }
    }

    // Seed admin user if not exists
    const adminEmail = 'aaaaaa@gmail.com';
    const existingAdmin = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const adminRole = await this.roleRepository.findOne({
        where: { name: RoleEnum.ADMIN },
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

    // Seed PROCESS_RH user if not exists
  const rhEmail = 'process.rh@example.com'; // Change to desired email
  const existingRhUser = await this.userRepository.findOne({
    where: { email: rhEmail },
  });

  if (!existingRhUser) {
    const rhRole = await this.roleRepository.findOne({
      where: { name: RoleEnum.PROCESS_RH },
    });

    if (!rhRole) {
      throw new Error(`Role ${RoleEnum.PROCESS_RH} not found. Make sure roles are seeded properly.`);
    }

    const hashedPassword = await bcrypt.hash('securepassword', await bcrypt.genSalt()); // Change password as needed

    const rhUser = this.userRepository.create({
      username: 'processrh',
      email: rhEmail,
      firstName: 'Process',
      lastName: 'RH',
      password: hashedPassword,
      role: rhRole,
      accountStatus: AccountStatus.ACTIVE,
    });

    await this.userRepository.save(rhUser);
  }

    // Similarly, you can seed other users if needed
  }
}
