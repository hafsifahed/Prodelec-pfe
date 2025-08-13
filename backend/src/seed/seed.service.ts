import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Role as RoleEntity } from '../roles/entities/role.entity';
import { Action } from '../roles/enums/action.enum';
import { Resource } from '../roles/enums/resource.enum';
import { Role as RoleEnum } from '../roles/enums/roles.enum';

import { Setting } from '../setting/entities/setting.entity';
import { User } from '../users/entities/users.entity';
import { AccountStatus } from '../users/enums/account-status.enum';
import { UsersService } from '../users/users.service';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Setting)
    private readonly settingRepo: Repository<Setting>,

    private readonly usersService: UsersService,   // ✅  on injecte le service
    private readonly config: ConfigService,
  ) {}

  /* ---------------------------------------------------------------- */
  async onApplicationBootstrap() {
    await this.seedRoles();
    await this.seedAdminUser();
    await this.seedProcessUsers();
    await this.seedDefaultSetting();
  }

  /* --------------------------- RÔLES -------------------------------- */

  private async seedRoles() {
    const roleDefinitions = new Map<RoleEnum, { resource: Resource; actions: Action[] }[]>([
      [RoleEnum.ADMIN,              this.fullAccess()],
      [RoleEnum.SUBADMIN,           this.subAdmin()],
      [RoleEnum.PROCESS_QUALITY,    this.qualityProc()],
      [RoleEnum.PROCESS_DESIGN,     this.designProc()],
      [RoleEnum.PROCESS_METHOD,     this.methodProc()],
      [RoleEnum.PROCESS_PRODUCTION, this.productionProc()],
      [RoleEnum.PROCESS_LOGISTICS,  this.logisticsProc()],
      [RoleEnum.PROCESS_DAF,        this.dafProc()],
      [RoleEnum.PROCESS_RH,         this.rhProc()],
      [RoleEnum.CLIENT_ADMIN,       this.clientAdmin()],
      [RoleEnum.CLIENT_USER,        this.clientUser()],
      [RoleEnum.RESPONSABLE_CONCEPTION, this.responsableConceptionProc()],
      [RoleEnum.RESPONSABLE_QUALITE, this.responsableQualiteProc()],
      [RoleEnum.RESPONSABLE_METHODE, this.responsableMethodeProc()],
      [RoleEnum.RESPONSABLE_PRODUCTION, this.responsableProductionProc()],
      [RoleEnum.RESPONSABLE_LOGISTIQUE, this.responsableLogistiqueProc()],
      [RoleEnum.RESPONSABLE_INDUSTRIALISATION, this.fullAccess()],

    ]);

    for (const [name, permissions] of roleDefinitions) {
      const exists = await this.roleRepo.findOne({ where: { name } });
      if (!exists) {
        await this.roleRepo.save(this.roleRepo.create({ name, permissions, isSystemRole: true }));
        this.logger.log(`✓ Role créé : ${name}`);
      }
    }
  }

  /* ------------------------ UTILITAIRES PERSMISSIONS ---------------- */

  private fullAccess()        { return Object.values(Resource).map(r => ({ resource: r, actions: [Action.MANAGE] })); }
  private subAdmin()          { return [ { resource: Resource.USERS,   actions: [Action.READ, Action.CREATE, Action.UPDATE] },
                                         { resource: Resource.PRODUCTS,actions: [Action.READ, Action.CREATE, Action.UPDATE] },
                                         { resource: Resource.ORDERS,  actions: [Action.READ, Action.EXPORT] } ]; }
  private qualityProc()       { return [ { resource: Resource.QUALITY, actions: [Action.MANAGE] },
                                         { resource: Resource.PRODUCTS,actions: [Action.READ, Action.UPDATE] } ]; }
  private designProc()        { return [ { resource: Resource.PRODUCTS,actions: [Action.MANAGE] },
                                         { resource: Resource.PRODUCTION,actions: [Action.READ] } ]; }
  private methodProc()        { return [ { resource: Resource.METHOD,actions: [Action.MANAGE] },
                                         { resource: Resource.PRODUCTION,actions: [Action.READ, Action.UPDATE] },
                                         { resource: Resource.PRODUCTS,actions: [Action.READ] } ]; }
  private productionProc()    { return [ { resource: Resource.PRODUCTION,actions: [Action.MANAGE] },
                                         { resource: Resource.INVENTORY, actions: [Action.READ, Action.UPDATE] },
                                         { resource: Resource.LOGISTICS, actions: [Action.READ] } ]; }
  private logisticsProc()     { return [ { resource: Resource.LOGISTICS,actions: [Action.MANAGE] },
                                         { resource: Resource.ORDERS,   actions: [Action.CREATE, Action.READ, Action.UPDATE] },
                                         { resource: Resource.INVENTORY,actions: [Action.READ] } ]; }
  private dafProc()           { return [ { resource: Resource.FINANCE, actions: [Action.MANAGE] },
                                         { resource: Resource.ORDERS,  actions: [Action.READ, Action.EXPORT] },
                                         { resource: Resource.SETTINGS,actions: [Action.READ] } ]; }
  private rhProc()            { return [ { resource: Resource.HR,      actions: [Action.MANAGE] },
                                         { resource: Resource.USERS,   actions: [Action.READ, Action.UPDATE] },
                                         { resource: Resource.SESSIONS,actions: [Action.READ] } ]; }
  private clientAdmin()       { return [ { resource: Resource.USERS,   actions: [Action.CREATE, Action.READ, Action.UPDATE] },
                                         { resource: Resource.PRODUCTS,actions: [Action.READ] },
                                         { resource: Resource.ORDERS,  actions: [Action.MANAGE] } ]; }
  private clientUser()        { return [ { resource: Resource.PRODUCTS,actions: [Action.READ] },
                                         { resource: Resource.ORDERS,  actions: [Action.CREATE, Action.READ] } ]; }
  private responsableConceptionProc() {
  return [
    { resource: Resource.PRODUCTS, actions: [Action.MANAGE] },
    { resource: Resource.DESIGN, actions: [Action.READ] },
  ];
}

private responsableQualiteProc() {
  return [
    { resource: Resource.QUALITY, actions: [Action.MANAGE] },
  ];
}

private responsableMethodeProc() {
  return [
    { resource: Resource.METHOD, actions: [Action.MANAGE] },
  ];
}

private responsableProductionProc() {
  return [
    { resource: Resource.PRODUCTION, actions: [Action.MANAGE] },
  ];
}

private responsableLogistiqueProc() {
  return [
    { resource: Resource.LOGISTICS, actions: [Action.MANAGE] },
  ];
}

private responsableIndustrialisationProc() {
  return [
    { resource: Resource.PROJECT, actions: [Action.MANAGE] },
    { resource: Resource.ORDERS, actions: [Action.MANAGE] },
  ];
}

  /* ---------------------------- ADMIN -------------------------------- */

  private async seedAdminUser() {
    const email = this.config.get<string>('ADMIN_EMAIL', 'admin@example.com');
    const password = this.config.get<string>('ADMIN_PASSWORD', 'aaaaaaaaa');

    const exists = await this.userRepo.findOne({ where: { email } });
    if (exists) return;

    const role = await this.roleRepo.findOne({ where: { name: RoleEnum.ADMIN } });
    if (!role) throw new Error('Admin role not found');

    const dto: any = {
      username: 'admin',
      email,
      firstName: 'System',
      lastName: 'Administrator',
      password,
      roleId: role.id,
    };

    await this.usersService.create(dto);      // ✅ Hachage + validations centralisées
    await this.userRepo.update({ email }, { accountStatus: AccountStatus.ACTIVE });

    this.logger.log('✓ Utilisateur admin créé');
  }

  /* ----------------------- UTILISATEURS PROCESS ---------------------- */

  private async seedProcessUsers() {
  const configs: Array<{ role: RoleEnum; email: string; first: string }> = [
    { role: RoleEnum.PROCESS_RH,         email: 'rh.process@example.com',         first: 'HR'         },
    { role: RoleEnum.PROCESS_METHOD,     email: 'method.process@example.com',     first: 'Method'     },
    { role: RoleEnum.PROCESS_PRODUCTION, email: 'production.process@example.com', first: 'Production' },
    { role: RoleEnum.PROCESS_LOGISTICS,  email: 'logistics.process@example.com',  first: 'Logistics'  },
    { role: RoleEnum.PROCESS_DAF,        email: 'daf.process@example.com',        first: 'DAF'        },
    { role: RoleEnum.PROCESS_QUALITY,    email: 'quality.process@example.com',    first: 'Quality'    },
    { role: RoleEnum.PROCESS_DESIGN,     email: 'design.process@example.com',     first: 'Design'     },

    // Nouveaux responsables
    { role: RoleEnum.RESPONSABLE_INDUSTRIALISATION, email: 'responsable.industrialisation@example.com', first: 'Responsable Industrialisation' },
    { role: RoleEnum.RESPONSABLE_CONCEPTION, email: 'responsable.conception@example.com', first: 'Responsable Conception' },
    { role: RoleEnum.RESPONSABLE_QUALITE,    email: 'responsable.qualite@example.com',    first: 'Responsable Qualité'    },
    { role: RoleEnum.RESPONSABLE_METHODE,    email: 'responsable.methode@example.com',    first: 'Responsable Méthode'    },
    { role: RoleEnum.RESPONSABLE_PRODUCTION, email: 'responsable.production@example.com', first: 'Responsable Production' },
    { role: RoleEnum.RESPONSABLE_LOGISTIQUE, email: 'responsable.logistique@example.com', first: 'Responsable Logistique' },
  ];

  for (const cfg of configs) {
    if (await this.userRepo.findOne({ where: { email: cfg.email } })) continue;

    const role = await this.roleRepo.findOne({ where: { name: cfg.role } });
    if (!role) {
      this.logger.warn(`Role ${cfg.role} not found`);
      continue;
    }

    const dto: any = {
      username: cfg.email.split('@')[0],
      email: cfg.email,
      firstName: cfg.first,
      lastName: 'Process',
      password: 'aaaaaaaaa', // sera haché par UsersService
      roleId: role.id,
    };

    await this.usersService.create(dto);
    await this.userRepo.update({ email: cfg.email }, { accountStatus: AccountStatus.ACTIVE });

    this.logger.log(`✓ Utilisateur process créé : ${cfg.email}`);
  }
}


  /*-------------------------Setting-------------------*/
  private async seedDefaultSetting() {
  const existing = await this.settingRepo.findOne({ where: { id: 1 } });
  if (!existing) {
    const setting = this.settingRepo.create({ reclamationTarget: 3 });
    await this.settingRepo.save(setting);
    this.logger.log('✓ Setting par défaut créé (reclamationTarget = 3)');
  } else {
    this.logger.log('✓ Setting déjà existant, aucune création');
  }
}

}
