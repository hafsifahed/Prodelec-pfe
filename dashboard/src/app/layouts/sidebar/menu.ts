// enums matching your NestJS backend

export enum Role {
    ADMIN = 'ADMIN',
    SUBADMIN = 'SUBADMIN',
    PROCESS_QUALITY = 'Processus Management Qualité',
    PROCESS_DESIGN = 'Processus Conception ET Développement',
    PROCESS_METHOD = 'Processus Méthode',
    PROCESS_PRODUCTION = 'Processus Production',
    PROCESS_LOGISTICS = 'Processus Logistique ET Commerciale',
    PROCESS_DAF = 'Processus DAF',
    PROCESS_RH = 'Processus Rh',
    CLIENT_ADMIN = 'CLIENTADMIN',
    CLIENT_USER = 'CLIENTUSER'
  }
  
  export enum Resource {
    USERS = 'users',
    ROLES = 'roles',
    PARTNERS = 'partners',
    SETTINGS = 'settings',
    PRODUCTS = 'products',
    ORDERS = 'orders',
    INVENTORY = 'inventory',
    QUALITY = 'quality',
    PRODUCTION = 'production',
    LOGISTICS = 'logistics',
    HR = 'hr',
    FINANCE = 'finance',
    METHOD = 'method',
    AUDIT_LOGS = 'audit_logs',
    SESSIONS = 'sessions'
  }
  
  export enum Action {
    CREATE = 'create',
    READ = 'read',
    UPDATE = 'update',
    DELETE = 'delete',
    MANAGE = 'manage',
    APPROVE = 'approve',
    EXPORT = 'export',
    IMPORT = 'import',
    ASSIGN = 'assign'
  }
  
  // MenuItem interface
  export interface MenuItem {
    id: number;
    label: string;
    icon?: string;
    link?: string;
    isTitle?: boolean;
    rolePermissions?: {
      resource: Resource;
      actions: Action[];
      roles?: Role[];
    }[];
    subItems?: MenuItem[];
    parentId?: number;
  }
  
  // The MENU configuration
  export const MENU: MenuItem[] = [
    {
      id: 1,
      label: 'MENUITEMS.MENU.TEXT',
      isTitle: true,
    },
    {
      id: 2,
      label: 'Tableau de bord',
      icon: 'bx-home-circle',
      link: '/dashboard',
    },
    {
      id: 3,
      label: 'Utilisateurs',
      icon: 'bx-user',
      rolePermissions: [
        { resource: Resource.USERS, actions: [Action.MANAGE], roles: [Role.ADMIN] },
        { resource: Resource.USERS, actions: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE], roles: [Role.CLIENT_ADMIN] }
      ],
      subItems: [
        {
          id: 32,
          label: 'Liste Utilisateurs',
          icon: 'bx-user',
          link: '/list-user',
        },
        {
          id: 33,
          label: 'Liste Partenaires',
          icon: 'bx-user',
          link: '/list-partner',
        },
      ],
    },
    {
        id: 39,
        label: 'Roles',
        icon: 'bx-money',
        link: '/roles',
        rolePermissions: [
          { resource: Resource.ROLES, actions: [Action.MANAGE], roles: [Role.ADMIN] },
          { resource: Resource.ROLES, actions: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE], roles: [Role.CLIENT_ADMIN, Role.CLIENT_USER] }
        ],
      },
    {
      id: 4,
      label: 'Cahier des charges',
      icon: 'bx-file',
      link: '/cdc',
      rolePermissions: [
        { resource: Resource.PRODUCTS, actions: [Action.MANAGE], roles: [Role.ADMIN] },
        { resource: Resource.PRODUCTS, actions: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE], roles: [Role.CLIENT_ADMIN, Role.CLIENT_USER] }
      ],
    },
    {
      id: 5,
      label: 'Devis',
      icon: 'bx-money',
      link: '/devis',
      rolePermissions: [
        { resource: Resource.ORDERS, actions: [Action.MANAGE], roles: [Role.ADMIN] },
        { resource: Resource.ORDERS, actions: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE], roles: [Role.CLIENT_ADMIN, Role.CLIENT_USER] }
      ],
    },
    {
      id: 6,
      label: 'Commandes',
      icon: 'bx-cart',
      link: '/listorder',
      rolePermissions: [
        { resource: Resource.ORDERS, actions: [Action.MANAGE], roles: [Role.ADMIN] },
        { resource: Resource.ORDERS, actions: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE], roles: [Role.CLIENT_ADMIN, Role.CLIENT_USER] }
      ],
    },
    {
      id: 7,
      label: 'Projets',
      icon: 'bx-briefcase',
      link: '/listproject',
      rolePermissions: [
        { resource: Resource.PRODUCTION, actions: [Action.MANAGE], roles: [Role.ADMIN] },
        { resource: Resource.PRODUCTION, actions: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE], roles: [Role.CLIENT_ADMIN, Role.CLIENT_USER] }
      ],
    },
    {
      id: 8,
      label: 'Réclamation',
      icon: 'bx-error',
      link: '/reclamation',
      rolePermissions: [
        { resource: Resource.QUALITY, actions: [Action.MANAGE], roles: [Role.ADMIN] },
        { resource: Resource.QUALITY, actions: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE], roles: [Role.CLIENT_ADMIN, Role.CLIENT_USER] }
      ],
    },
    {
      id: 9,
      label: 'Notifications',
      icon: 'bx-bell',
      link: '/list-notifications',
      rolePermissions: [
        { resource: Resource.AUDIT_LOGS, actions: [Action.MANAGE], roles: [Role.ADMIN] },
        { resource: Resource.AUDIT_LOGS, actions: [Action.READ], roles: [Role.CLIENT_ADMIN, Role.CLIENT_USER] }
      ],
    },
    {
      id: 10,
      label: 'Session',
      icon: 'bx-time',
       link: '/list-user-session',

      rolePermissions: [
        { resource: Resource.SESSIONS, actions: [Action.MANAGE], roles: [Role.ADMIN] },
        { resource: Resource.SESSIONS, actions: [Action.READ], roles: [Role.CLIENT_ADMIN, Role.CLIENT_USER] }
      ],
    },
    {
      id: 11,
      label: 'Archive',
      icon: 'bx-archive',
      rolePermissions: [
        { resource: Resource.ORDERS, actions: [Action.EXPORT], roles: [Role.ADMIN, Role.CLIENT_ADMIN] }
      ],
      subItems: [
        {
          id: 111,
          label: 'Archive Commandes',
          icon: 'bx-archive',
          link: '/archiveorderadminclient',
          parentId: 11,
        },
        {
          id: 112,
          label: 'Archive Projets',
          icon: 'bx-archive',
          link: '/archiveprojectadminclient',
          parentId: 11,
        },
      ],
    },
  ];
  