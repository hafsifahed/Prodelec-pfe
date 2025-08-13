import { Action, Resource, RoleName } from "src/app/core/models/role.model";
import { MenuItem, MenuItemRolePermissions } from './menu.model';

const purl = "";

export const MENU: MenuItem[] = [
  { id: 1, label: 'MENUITEMS.MENU.TEXT', isTitle: true },
  { id: 2, label: 'Tableau de bord', icon: 'bx-home-circle', link: purl + '/dashboard' },
  
  {
    id: 3, label: 'Utilisateurs', icon: 'bx-user', link: purl + '/list-user',
    accessOnly: 'WORKER',
    rolePermissions: [
      { resource: Resource.USERS, actions: [Action.MANAGE], roles: [RoleName.ADMIN] },
      { resource: Resource.USERS, actions: [Action.READ], roles: [RoleName.CLIENT_ADMIN] }
    ],
  },
  {
    id: 13, label: 'Employés', icon: 'bx-user', link: purl + '/list-worker',
    accessOnly: 'WORKER',
    rolePermissions: [
      { resource: Resource.USERS, actions: [Action.MANAGE], roles: [RoleName.ADMIN] },
    ],
  },
  {
    id: 30, label: 'Calendrier', icon: 'bx-calendar-alt', link: purl + '/calendrier'
  },
  {
    id: 37, label: 'Calendrier Global', icon: 'bx-calendar-alt', link: purl + '/calendrierGlobal',
    accessOnly: 'WORKER',
    rolePermissions: [
      { resource: Resource.PROJECT, actions: [Action.MANAGE] },
    ],
  },
  
  {
    id: 390, label: 'Liste Partenaires', icon: 'bx-building', link: purl + '/list-partner',
    accessOnly: 'WORKER',
    rolePermissions: [
      { resource: Resource.ROLES, actions: [Action.MANAGE], roles: [RoleName.ADMIN] },
    ]
  },
  
  {
    id: 39, label: 'Roles', icon: 'bx-lock', link: purl + '/roles',
    accessOnly: 'WORKER',
    rolePermissions: [
      { resource: Resource.ROLES, actions: [Action.MANAGE], roles: [RoleName.ADMIN] },
    ]
  },
  
  {
    id: 4, label: 'Cahier des charges (Admin)', icon: 'bx-file', link: purl + '/cdc',
    accessOnly: 'WORKER',
    rolePermissions: [
      { resource: Resource.PRODUCTS, actions: [Action.MANAGE], roles: [RoleName.ADMIN, RoleName.RESPONSABLE_INDUSTRIALISATION] }
    ]
  },
  {
    id: 40, label: 'Cahier des charges (Client)', icon: 'bx-file', link: purl + '/cdcUser',
    accessOnly: 'CLIENT',
    rolePermissions: [
      { resource: Resource.PRODUCTS, actions: [Action.READ], roles: [RoleName.CLIENT_ADMIN, RoleName.CLIENT_USER] }
    ]
  },
  
  {
    id: 5, label: 'Devis (Admin)', icon: 'bx-money', link: purl + '/devis',
    accessOnly: 'WORKER',
    rolePermissions: [
      { resource: Resource.ORDERS, actions: [Action.MANAGE], roles: [RoleName.ADMIN, RoleName.RESPONSABLE_INDUSTRIALISATION] }
    ]
  },
  {
    id: 50, label: 'Devis (Client)', icon: 'bx-money', link: purl + '/devisUser',
    accessOnly: 'CLIENT',
    rolePermissions: [
      { resource: Resource.ORDERS, actions: [Action.READ], roles: [RoleName.CLIENT_ADMIN, RoleName.CLIENT_USER] }
    ]
  },
  
  {
    id: 6, label: 'Commandes (Admin)', icon: 'bx-cart', link: purl + '/listorder',
    accessOnly: 'WORKER',
    rolePermissions: [
      { resource: Resource.ORDERS, actions: [Action.MANAGE], roles: [RoleName.ADMIN, RoleName.RESPONSABLE_INDUSTRIALISATION] }
    ]
  },
  {
    id: 60, label: 'Commandes (Client)', icon: 'bx-cart', link: purl + '/listorderclient',
    accessOnly: 'CLIENT',
    rolePermissions: [
      { resource: Resource.ORDERS, actions: [Action.READ], roles: [RoleName.CLIENT_ADMIN, RoleName.CLIENT_USER] }
    ]
  },
  
  {
    id: 7, label: 'Projets (Admin)', icon: 'bx-briefcase', link: purl + '/listproject',
    accessOnly: 'WORKER',
    rolePermissions: [
      { resource: Resource.PROJECT, actions: [Action.MANAGE, Action.READ, Action.UPDATE], roles: [RoleName.ADMIN, RoleName.SUBADMIN, RoleName.RESPONSABLE_INDUSTRIALISATION] },
      { resource: Resource.PROJECT, actions: [Action.READ, Action.UPDATE], roles: [RoleName.PROCESS_DESIGN, RoleName.PROCESS_LOGISTICS, RoleName.PROCESS_PRODUCTION, RoleName.PROCESS_QUALITY, RoleName.PROCESS_DAF] }
    ]
  },
  {
    id: 70, label: 'Projets (Client)', icon: 'bx-briefcase', link: purl + '/listprojectclient',
    accessOnly: 'CLIENT',
    rolePermissions: [
      { resource: Resource.PROJECT, actions: [Action.READ], roles: [RoleName.CLIENT_ADMIN, RoleName.CLIENT_USER] }
    ]
  },
  {
    id: 71, label: 'Projets (Admin Client)', icon: 'bx-briefcase', link: purl + '/listprojetclientadmin',
    accessOnly: 'CLIENT',
    rolePermissions: [
      { resource: Resource.PROJECT, actions: [Action.READ], roles: [RoleName.CLIENT_ADMIN] }
    ]
  },
  
  {
    id: 8, label: 'Réclamation', icon: 'bx-error', link: purl + '/reclamation',
    rolePermissions: [
      { resource: Resource.QUALITY, actions: [Action.MANAGE], roles: [RoleName.ADMIN, RoleName.SUBADMIN] },
      { resource: Resource.QUALITY, actions: [Action.READ], roles: [RoleName.CLIENT_ADMIN, RoleName.CLIENT_USER] }
    ]
  },
  {
    id: 81, label: 'Avis', icon: 'bx-error', link: purl + '/list-avis',
    accessOnly: 'WORKER',
    rolePermissions: [
      { resource: Resource.QUALITY, actions: [Action.MANAGE], roles: [RoleName.ADMIN, RoleName.SUBADMIN, RoleName.RESPONSABLE_INDUSTRIALISATION] },
    ]
  },
  
  {
    id: 9, label: 'Notifications', icon: 'bx-bell', link: purl + '/list-notifications',
    rolePermissions: [
      { resource: Resource.AUDIT_LOGS, actions: [Action.READ] }
    ]
  },
  
  {
    id: 10, label: 'Sessions', icon: 'bx-time', link: purl + '/list-user-session',
    accessOnly: 'WORKER',
    rolePermissions: [
      { resource: Resource.SESSIONS, actions: [Action.READ], roles: [RoleName.ADMIN] }
    ]
  },
  
  {
    id: 11, label: 'Archive', icon: 'bx-archive',
    rolePermissions: [
      { resource: Resource.ORDERS, actions: [Action.EXPORT], roles: [RoleName.ADMIN, RoleName.CLIENT_ADMIN] }
    ],
    subItems: [
      { id: 111, label: 'Archive Commandes', link: purl + '/archiveorderadminclient', parentId: 11 },
      { id: 112, label: 'Archive Projets', link: purl + '/archiveprojectadminclient', parentId: 11 }
    ]
  },
  
  {
    id: 12, label: 'Settings', icon: 'bx-cog', link: purl + '/setting',
    accessOnly: 'WORKER',
    rolePermissions: [
      { resource: Resource.SETTINGS, actions: [], roles: [RoleName.ADMIN] }
    ]
  },
];