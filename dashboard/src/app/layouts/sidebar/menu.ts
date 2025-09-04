import { Action, Resource, RoleName } from "src/app/core/models/role.model";
import { MenuItem, MenuItemRolePermissions } from './menu.model';

const purl = '';

export const MENU: MenuItem[] = [
  // ===== Tableau de bord =====
  { id: 1, label: 'MENUITEMS.MENU.TEXT', isTitle: true },
  { id: 2, label: 'Tableau de bord', icon: 'bx-home-circle', link: purl + '/dashboard' },
  { id: 3, label: 'Discussions', icon: 'bx-message-dots', link: purl + '/workflow-discussions' },

  // ===== Gestion des utilisateurs =====
  {
    id: 10,
    label: 'Gestion Utilisateurs',
    icon: 'bx-group',
    subItems: [
      {
        id: 101, label: 'Utilisateurs', icon: 'bx-user', link: purl + '/list-user',
        rolePermissions: [
          { resource: Resource.USERS, actions: [Action.MANAGE], roles: [RoleName.ADMIN] },
          { resource: Resource.USERS, actions: [Action.READ], roles: [RoleName.CLIENT_ADMIN,RoleName.CLIENT_USER] },
        ],
      },
      {
        id: 102, label: 'Employés', icon: 'bx-user', link: purl + '/list-worker',
        accessOnly: 'WORKER',
        rolePermissions: [
          { resource: Resource.USERS, actions: [Action.MANAGE], roles: [RoleName.ADMIN] },
        ],
      },
      {
        id: 103, label: 'Partenaires', icon: 'bx-building', link: purl + '/list-partner',
        accessOnly: 'WORKER',
        rolePermissions: [
          { resource: Resource.ROLES, actions: [Action.MANAGE], roles: [RoleName.ADMIN] },
        ],
      },
      {
        id: 104, label: 'Roles', icon: 'bx-lock', link: purl + '/roles',
        accessOnly: 'WORKER',
        rolePermissions: [
          { resource: Resource.ROLES, actions: [Action.MANAGE], roles: [RoleName.ADMIN] },
        ],
      },
      {
        id: 105, label: 'Sessions', icon: 'bx-time', link: purl + '/list-user-session',
        accessOnly: 'WORKER',
        rolePermissions: [
          { resource: Resource.SESSIONS, actions: [Action.READ], roles: [RoleName.ADMIN] },
        ],
      },
    ],
  },

  // ===== Gestion des documents =====
  {
    id: 20,
    label: 'Gestion Documents',
    icon: 'bx-file',
    subItems: [
      {
        id: 201, label: 'Cahier des charges (Admin)', link: purl + '/cdc',
        accessOnly: 'WORKER',
        rolePermissions: [
          { resource: Resource.PRODUCTS, actions: [Action.MANAGE], roles: [RoleName.ADMIN, RoleName.RESPONSABLE_INDUSTRIALISATION] },
        ],
      },
      {
        id: 202, label: 'Cahier des charges (Client)', link: purl + '/cdcUser',
        accessOnly: 'CLIENT',
        rolePermissions: [
          { resource: Resource.PRODUCTS, actions: [Action.READ], roles: [RoleName.CLIENT_ADMIN, RoleName.CLIENT_USER] },
        ],
      },
      {
        id: 203, label: 'Devis (Admin)', icon: 'bx-money', link: purl + '/devis',
        accessOnly: 'WORKER',
        rolePermissions: [
          { resource: Resource.ORDERS, actions: [Action.MANAGE], roles: [RoleName.ADMIN, RoleName.RESPONSABLE_INDUSTRIALISATION] },
        ],
      },
      {
        id: 204, label: 'Devis (Client)', icon: 'bx-money', link: purl + '/devisUser',
        accessOnly: 'CLIENT',
        rolePermissions: [
          { resource: Resource.ORDERS, actions: [Action.READ], roles: [RoleName.CLIENT_ADMIN, RoleName.CLIENT_USER] },
        ],
      },
    ],
  },

  // ===== Commandes & Projets =====
  {
    id: 30,
    label: 'Commandes & Projets',
    icon: 'bx-cart',
    subItems: [
      {
        id: 301, label: 'Commandes (Admin)', link: purl + '/listorder',
        accessOnly: 'WORKER',
        rolePermissions: [
          { resource: Resource.ORDERS, actions: [Action.MANAGE], roles: [RoleName.ADMIN, RoleName.RESPONSABLE_INDUSTRIALISATION] },
        ],
      },
      {
        id: 302, label: 'Commandes (Client)', link: purl + '/listorderclient',
        accessOnly: 'CLIENT',
        rolePermissions: [
          { resource: Resource.ORDERS, actions: [Action.READ], roles: [RoleName.CLIENT_ADMIN, RoleName.CLIENT_USER] },
        ],
      },
      {
        id: 303, label: 'Projets (Admin)', link: purl + '/listproject',
        accessOnly: 'WORKER',
        rolePermissions: [
          { resource: Resource.PROJECT, actions: [Action.MANAGE, Action.READ, Action.UPDATE], roles: [RoleName.ADMIN, RoleName.SUBADMIN, RoleName.RESPONSABLE_INDUSTRIALISATION] },
          { resource: Resource.PROJECT, actions: [Action.READ, Action.UPDATE], roles: [RoleName.PROCESS_DESIGN, RoleName.PROCESS_LOGISTICS, RoleName.PROCESS_PRODUCTION, RoleName.PROCESS_QUALITY, RoleName.PROCESS_DAF] },
        ],
      },
      {
        id: 304, label: 'Projets (Client)', link: purl + '/listprojectclient',
        accessOnly: 'CLIENT',
        rolePermissions: [
          { resource: Resource.PROJECT, actions: [Action.READ], roles: [RoleName.CLIENT_ADMIN, RoleName.CLIENT_USER] },
        ],
      },
      {
        id: 305, label: 'Projets (Admin Client)', link: purl + '/listprojetclientadmin',
        accessOnly: 'CLIENT',
        rolePermissions: [
          { resource: Resource.PROJECT, actions: [Action.MANAGE], roles: [RoleName.CLIENT_ADMIN] },
        ],
      },
    ],
  },

  // ===== Réclamations & Avis =====
  {
    id: 40,
    label: 'Qualité',
    icon: 'bx-error',
    subItems: [
      {
        id: 401, label: 'Réclamations (Admin)', link: purl + '/reclamation',
                    accessOnly: 'WORKER',
        rolePermissions: [
          { resource: Resource.QUALITY, actions: [Action.MANAGE], roles: [RoleName.ADMIN, RoleName.SUBADMIN] },
        ],
      },
      {
        id: 402, label: 'Réclamations (Client)', link: purl + '/reclamationUser',
            accessOnly: 'CLIENT',
        rolePermissions: [
          { resource: Resource.QUALITY, actions: [Action.READ], roles: [RoleName.CLIENT_ADMIN, RoleName.CLIENT_USER] },
        ],
      },
      {
        id: 403, label: 'Avis', link: purl + '/list-avis',
        accessOnly: 'WORKER',
        rolePermissions: [
          { resource: Resource.QUALITY, actions: [Action.MANAGE], roles: [RoleName.ADMIN, RoleName.SUBADMIN, RoleName.RESPONSABLE_INDUSTRIALISATION] },
        ],
      },
    ],
  },

  // ===== Outils =====
  {
    id: 50,
    label: 'Outils',
    icon: 'bx-wrench',
    subItems: [
      { id: 501, label: 'Calendrier', icon: 'bx-calendar-alt', link: purl + '/calendrier' },
      {
        id: 502, label: 'Calendrier Global', icon: 'bx-calendar-alt', link: purl + '/calendrierGlobal',
        accessOnly: 'WORKER',
        rolePermissions: [
          { resource: Resource.PROJECT, actions: [Action.MANAGE] },
        ],
      },
      {
        id: 503, label: 'Notifications', icon: 'bx-bell', link: purl + '/list-notifications',
        accessOnly: 'WORKER',
        rolePermissions: [
          { resource: Resource.AUDIT_LOGS, actions: [Action.READ,Action.UPDATE] },
        ],
      },
       {
        id: 504, label: 'BulkEmail', icon: 'bx-bell', link: purl + '/bulk-email',
        rolePermissions: [
          { resource: Resource.AUDIT_LOGS, actions: [Action.UPDATE,Action.MANAGE] },
        ],
      },
      {
        id: 505, label: 'Settings', icon: 'bx-cog', link: purl + '/setting',
        accessOnly: 'WORKER',
        rolePermissions: [
          { resource: Resource.SETTINGS, actions: [], roles: [RoleName.ADMIN] },
        ],
      },
    ],
  },

  // ===== Archives =====
  {
    id: 60,
    label: 'Archives',
    icon: 'bx-archive',
    subItems: [
      {
        id: 601, label: 'Archive Commandes', link: purl + '/archiveorderadminclient',
        rolePermissions: [
          { resource: Resource.ORDERS, actions: [Action.EXPORT], roles: [RoleName.ADMIN, RoleName.CLIENT_ADMIN] },
        ],
      },
      {
        id: 602, label: 'Archive Projets', link: purl + '/archiveprojectadminclient',
        rolePermissions: [
          { resource: Resource.ORDERS, actions: [Action.EXPORT], roles: [RoleName.ADMIN, RoleName.CLIENT_ADMIN] },
        ],
      },
    ],
  },
];
