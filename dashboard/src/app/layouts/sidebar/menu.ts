import { Action, Resource, RoleName } from "src/app/core/models/role.model";

/* ---- Interface Menu ---- */
export interface MenuItem {
  id: number;
  label: string;
  icon?: string;
  link?: string;
  isTitle?: boolean;
  rolePermissions?: {
    resource: Resource;
    actions: Action[];
    roles?: RoleName[];
  }[];
  subItems?: MenuItem[];
  parentId?: number;
}
const purl=""
/* ---- Menu Configuration ---- */
export const MENU: MenuItem[] = [
  { id: 1, label: 'MENUITEMS.MENU.TEXT', isTitle: true },

  { id: 2, label: 'Tableau de bord', icon: 'bx-home-circle', link: purl+'/dashboard' },

  /* --- Utilisateurs --- */
  {
    id: 3, label: 'Utilisateurs', icon: 'bx-user', link: purl+'/list-user',
    rolePermissions: [
      { resource: Resource.USERS, actions: [Action.MANAGE], roles: [RoleName.ADMIN] },
      { resource: Resource.USERS, actions: [Action.READ],   roles: [RoleName.CLIENT_ADMIN] }
    ],
  },
    {
    id: 13, label: 'Employés', icon: 'bx-user', link: purl+'/list-worker',
    rolePermissions: [
      { resource: Resource.USERS, actions: [Action.MANAGE], roles: [RoleName.ADMIN] },
    ],
  },
    {
    id: 3, label: 'Calendrier', icon: 'bx-calendar-alt', link: purl+'/calendrier',
    /*rolePermissions: [
      { resource: Resource.USERS, actions: [Action.MANAGE], roles: [RoleName.ADMIN] },
      { resource: Resource.USERS, actions: [Action.READ],   roles: [RoleName.CLIENT_ADMIN] }
    ],*/
  },//, roles: [RoleName.ADMIN] 
    {
    id: 37, label: 'Calendrier Global', icon: 'bx-calendar-alt', link: purl+'/calendrierGlobal',
    rolePermissions: [
      { resource: Resource.PROJECT, actions: [Action.MANAGE]},
    ],
  },

  /* --- Partenaires --- */
  {
    id: 390, label: 'Liste Partenaires', icon: 'bx-building', link: purl+'/list-partner',
    rolePermissions: [
      { resource: Resource.ROLES, actions: [Action.MANAGE], roles: [RoleName.ADMIN] },
    ]
  },

  /* --- Rôles --- */
  {
    id: 39, label: 'Roles', icon: 'bx-lock', link: purl+'/roles',
    rolePermissions: [
      { resource: Resource.ROLES, actions: [Action.MANAGE], roles: [RoleName.ADMIN] },
    ]
  },

  /* --- Cahier des charges --- */
  {
    id: 4, label: 'Cahier des charges (Admin)', icon: 'bx-file', link: purl+'/cdc',
    rolePermissions: [
      { resource: Resource.PRODUCTS, actions: [Action.MANAGE], roles: [RoleName.ADMIN,RoleName.RESPONSABLE_INDUSTRIALISATION] }
    ]
  },
  {
    id: 40, label: 'Cahier des charges (Client)', icon: 'bx-file', link: purl+'/cdcUser',
    rolePermissions: [
      { resource: Resource.PRODUCTS, actions: [Action.READ], roles: [RoleName.CLIENT_ADMIN, RoleName.CLIENT_USER] }
    ]
  },

  /* --- Devis --- */
  {
    id: 5, label: 'Devis (Admin)', icon: 'bx-money', link: purl+'/devis',
    rolePermissions: [
      { resource: Resource.ORDERS, actions: [Action.MANAGE], roles: [RoleName.ADMIN,RoleName.RESPONSABLE_INDUSTRIALISATION] }
      
    ]
  },
  {
    id: 50, label: 'Devis (Client)', icon: 'bx-money', link: purl+'/devisUser',
    rolePermissions: [
      { resource: Resource.ORDERS, actions: [Action.READ], roles: [RoleName.CLIENT_ADMIN, RoleName.CLIENT_USER] }
    ]
  },

  /* --- Commandes --- */
  {
    id: 6, label: 'Commandes (Admin)', icon: 'bx-cart', link: purl+'/listorder',
    rolePermissions: [
      { resource: Resource.ORDERS, actions: [Action.MANAGE], roles: [RoleName.ADMIN,RoleName.RESPONSABLE_INDUSTRIALISATION] }
    ]
  },
  {
    id: 60, label: 'Commandes (Client)', icon: 'bx-cart', link: purl+'/listorderclient',
    rolePermissions: [
      { resource: Resource.ORDERS, actions: [Action.READ], roles: [RoleName.CLIENT_ADMIN, RoleName.CLIENT_USER] }
    ]
  },

  /* --- Projets --- */
  {
    id: 7, label: 'Projets (Admin)', icon: 'bx-briefcase', link: purl+'/listproject',
    rolePermissions: [
      { resource: Resource.PROJECT, actions: [Action.MANAGE,Action.READ,Action.UPDATE], roles: [RoleName.ADMIN,RoleName.SUBADMIN,RoleName.RESPONSABLE_INDUSTRIALISATION] },
      { resource: Resource.PROJECT, actions: [Action.READ,Action.UPDATE], roles: [RoleName.PROCESS_DESIGN,RoleName.PROCESS_LOGISTICS,RoleName.PROCESS_PRODUCTION,RoleName.PROCESS_QUALITY,RoleName.PROCESS_DAF] }

    ]
  },
  {
    id: 70, label: 'Projets (Client)', icon: 'bx-briefcase', link: purl+'/listprojectclient',
    rolePermissions: [
      { resource: Resource.PROJECT, actions: [Action.READ], roles: [RoleName.CLIENT_ADMIN, RoleName.CLIENT_USER] }
    ]
  },
  {
    id: 71, label: 'Projets (Admin Client)', icon: 'bx-briefcase', link: purl+'/listprojetclientadmin',
    rolePermissions: [
      { resource: Resource.PROJECT, actions: [Action.READ], roles: [RoleName.CLIENT_ADMIN] }
    ]
  },

  /* --- Réclamation --- */
  {
    id: 8, label: 'Réclamation', icon: 'bx-error', link: purl+'/reclamation',
    rolePermissions: [
      { resource: Resource.QUALITY, actions: [Action.MANAGE], roles: [RoleName.ADMIN,RoleName.SUBADMIN] },
      { resource: Resource.QUALITY, actions: [Action.READ],   roles: [RoleName.CLIENT_ADMIN, RoleName.CLIENT_USER] }
    ]
  },

  
  /* --- Réclamation --- */
  {
    id: 8, label: 'Avis', icon: 'bx-error', link: purl+'/list-avis',
    rolePermissions: [
      { resource: Resource.QUALITY, actions: [Action.MANAGE], roles: [RoleName.ADMIN,RoleName.SUBADMIN,RoleName.RESPONSABLE_INDUSTRIALISATION] },
    ]
  },

  /* --- Notifications --- */
  {
    id: 9, label: 'Notifications', icon: 'bx-bell', link: purl+'/list-notifications',
    rolePermissions: [
      { resource: Resource.AUDIT_LOGS, actions: [Action.READ] }
    ]
  },

  /* --- Sessions --- */
  {
    id: 10, label: 'Sessions', icon: 'bx-time', link: purl+'/list-user-session',
    rolePermissions: [
      { resource: Resource.SESSIONS, actions: [Action.READ], roles: [RoleName.ADMIN] }
    ]
  },

  /* --- Archives --- */
  {
    id: 11, label: 'Archive', icon: 'bx-archive',
    rolePermissions: [
      { resource: Resource.ORDERS, actions: [Action.EXPORT], roles: [RoleName.ADMIN, RoleName.CLIENT_ADMIN] }
    ],
    subItems: [
      { id: 111, label: 'Archive Commandes', link: purl+'/archiveorderadminclient',parentId: 11 },
      { id: 112, label: 'Archive Projets',   link: purl+'/archiveprojectadminclient',parentId: 11 }
    ]
  },
  /* --- Stting --- */
  {
    id: 10, label: 'Settings', icon: 'bx-cog', link: purl+'/setting',
    rolePermissions: [
      { resource: Resource.SETTINGS, actions: [], roles: [RoleName.ADMIN] }
    ]
  },
];
