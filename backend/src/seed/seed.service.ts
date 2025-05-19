import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    await this.seedRoles();
    await this.seedAdminUser();
    await this.seedProcessUsers();
  }

  private async seedRoles() {
    const roleDefinitions = new Map<RoleEnum, { resource: Resource; actions: Action[] }[]>([
      [RoleEnum.ADMIN, this.createFullAccessPermissions()],
      [RoleEnum.SUBADMIN, this.createSubadminPermissions()],
      [RoleEnum.PROCESS_QUALITY, this.createQualityProcessPermissions()],
      [RoleEnum.PROCESS_DESIGN, this.createDesignProcessPermissions()],
      [RoleEnum.PROCESS_METHOD, this.createMethodProcessPermissions()],
      [RoleEnum.PROCESS_PRODUCTION, this.createProductionProcessPermissions()],
      [RoleEnum.PROCESS_LOGISTICS, this.createLogisticsProcessPermissions()],
      [RoleEnum.PROCESS_DAF, this.createDafProcessPermissions()],
      [RoleEnum.PROCESS_RH, this.createRhProcessPermissions()],
      [RoleEnum.CLIENT_ADMIN, this.createClientAdminPermissions()],
      [RoleEnum.CLIENT_USER, this.createClientUserPermissions()],
    ]);

    for (const [roleName, permissions] of roleDefinitions) {
      const existingRole = await this.roleRepository.findOne({ where: { name: roleName } });
      
      if (!existingRole) {
        await this.roleRepository.save(
          this.roleRepository.create({
            name: roleName,
            permissions,
            isSystemRole: true,
          })
        );
        this.logger.log(`Created role: ${roleName}`);
      }
    }
  }

  private createFullAccessPermissions() {
    return Object.values(Resource).map(resource => ({
      resource,
      actions: [Action.MANAGE],
    }));
  }

  private createSubadminPermissions() {
    return [
      { resource: Resource.USERS, actions: [Action.READ, Action.CREATE, Action.UPDATE] },
      { resource: Resource.PRODUCTS, actions: [Action.READ, Action.CREATE, Action.UPDATE] },
      { resource: Resource.ORDERS, actions: [Action.READ, Action.EXPORT] },
    ];
  }

  private createQualityProcessPermissions() {
    return [
      { resource: Resource.QUALITY, actions: [Action.MANAGE] },
      { resource: Resource.PRODUCTS, actions: [Action.READ, Action.UPDATE] },
    ];
  }

  private createDesignProcessPermissions() {
    return [
      { resource: Resource.PRODUCTS, actions: [Action.MANAGE] },
      { resource: Resource.PRODUCTION, actions: [Action.READ] },
    ];
  }

  // Add similar methods for other process roles...

  private createClientAdminPermissions() {
    return [
      { resource: Resource.USERS, actions: [Action.CREATE, Action.READ, Action.UPDATE] },
      { resource: Resource.PRODUCTS, actions: [Action.READ] },
      { resource: Resource.ORDERS, actions: [Action.MANAGE] },
    ];
  }

  private createClientUserPermissions() {
    return [
      { resource: Resource.PRODUCTS, actions: [Action.READ] },
      { resource: Resource.ORDERS, actions: [Action.CREATE, Action.READ] },
    ];
  }
  // Add these methods to your SeedService class

private createMethodProcessPermissions() {
  return [
    { resource: Resource.METHOD, actions: [Action.MANAGE] },
    { resource: Resource.PRODUCTION, actions: [Action.READ, Action.UPDATE] },
    { resource: Resource.PRODUCTS, actions: [Action.READ] }
  ];
}

private createProductionProcessPermissions() {
  return [
    { resource: Resource.PRODUCTION, actions: [Action.MANAGE] },
    { resource: Resource.INVENTORY, actions: [Action.READ, Action.UPDATE] },
    { resource: Resource.LOGISTICS, actions: [Action.READ] }
  ];
}

private createLogisticsProcessPermissions() {
  return [
    { resource: Resource.LOGISTICS, actions: [Action.MANAGE] },
    { resource: Resource.ORDERS, actions: [Action.CREATE, Action.READ, Action.UPDATE] },
    { resource: Resource.INVENTORY, actions: [Action.READ] }
  ];
}

private createDafProcessPermissions() {
  return [
    { resource: Resource.FINANCE, actions: [Action.MANAGE] },
    { resource: Resource.ORDERS, actions: [Action.READ, Action.EXPORT] },
    { resource: Resource.SETTINGS, actions: [Action.READ] }
  ];
}

private createRhProcessPermissions() {
  return [
    { resource: Resource.HR, actions: [Action.MANAGE] },
    { resource: Resource.USERS, actions: [Action.READ, Action.UPDATE] },
    { resource: Resource.SESSIONS, actions: [Action.READ] }
  ];
}


  private async seedAdminUser() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL', 'admin@example.com');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD', 'StrongP@ss123!');

    const existingAdmin = await this.userRepository.findOne({ where: { email: adminEmail } });
    if (existingAdmin) return;

    const adminRole = await this.roleRepository.findOne({ where: { name: RoleEnum.ADMIN } });
    if (!adminRole) throw new Error('Admin role not found');

    const adminUser = this.userRepository.create({
      username: 'admin',
      email: adminEmail,
      firstName: 'System',
      lastName: 'Administrator',
      password: await bcrypt.hash(adminPassword, await bcrypt.genSalt()),
      role: adminRole,
      accountStatus: AccountStatus.ACTIVE,
    });

    await this.userRepository.save(adminUser);
    this.logger.log('Admin user created');
  }

  private async seedProcessUsers() {
    const processUsers = [
      {
        role: RoleEnum.PROCESS_RH,
        email: 'rh.process@example.com',
        password: 'aaaaaaaaa',
        firstName: 'HR',
        lastName: 'Process',
      },
      {
        role: RoleEnum.PROCESS_METHOD,
        email: 'method.process@example.com',
        password: 'aaaaaaaaa',
        firstName: 'Method',
        lastName: 'Process',
      },
      {
        role: RoleEnum.PROCESS_PRODUCTION,
        email: 'production.process@example.com',
        password: 'aaaaaaaaa',
        firstName: 'Production',
        lastName: 'Process',
      },
      {
        role: RoleEnum.PROCESS_LOGISTICS,
        email: 'logistics.process@example.com',
        password: 'aaaaaaaaa',
        firstName: 'Logistics',
        lastName: 'Process',
      },
      {
        role: RoleEnum.PROCESS_DAF,
        email: 'daf.process@example.com',
        password: 'aaaaaaaaa',
        firstName: 'DAF',
        lastName: 'Process',
      },
      {
        role: RoleEnum.PROCESS_QUALITY,
        email: 'quality.process@example.com',
        password: 'aaaaaaaaa',
        firstName: 'Quality',
        lastName: 'Process',
      },
      {
        role: RoleEnum.PROCESS_DESIGN,
        email: 'design.process@example.com',
        password: 'aaaaaaaaa',
        firstName: 'Design',
        lastName: 'Process',
      },
    ];
  
    for (const userConfig of processUsers) {
      const existingUser = await this.userRepository.findOne({ where: { email: userConfig.email } });
      if (existingUser) continue;
  
      const role = await this.roleRepository.findOne({ where: { name: userConfig.role } });
      if (!role) {
        this.logger.warn(`Role ${userConfig.role} not found for user ${userConfig.email}`);
        continue;
      }
  
      const user = this.userRepository.create({
        username: userConfig.email.split('@')[0],
        email: userConfig.email,
        firstName: userConfig.firstName,
        lastName: userConfig.lastName,
        password: await bcrypt.hash(userConfig.password, await bcrypt.genSalt()),
        role,
        accountStatus: AccountStatus.ACTIVE,
      });
  
      await this.userRepository.save(user);
      this.logger.log(`Created process user: ${userConfig.email}`);
    }
  }
  
}
