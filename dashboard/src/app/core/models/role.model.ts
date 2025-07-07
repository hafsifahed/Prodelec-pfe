// role.model.ts

// Enum des actions possibles (copie conforme à ton backend)
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

// Enum des ressources (copie conforme à ton backend)
export enum Resource {
  USERS = 'users',
  ROLES = 'roles',
  PARTNERS = 'partners',
  SETTINGS = 'settings',
  PRODUCTS = 'products',
  PROJECT='project',
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

// Enum des noms de rôles (tu peux aussi importer ceux du backend via un service ou fichier partagé)
export enum RoleName {
  ADMIN = 'ADMIN',
  SUBADMIN = 'SUBADMIN',
  PROCESS_QUALITY = 'Processus Management Qualité',
  PROCESS_DESIGN = 'Processus Conception ET Développement',
  PROCESS_METHOD = 'Processus Méthode',
  PROCESS_PRODUCTION = 'Processus Production',
  PROCESS_LOGISTICS = 'Processus Logistique ET Commerciale',
  PROCESS_DAF = 'Processus DAF',
  PROCESS_RH = 'Processus Rh',
  CLIENT_ADMIN = 'CLIENT ADMIN',
  CLIENT_USER = 'CLIENTUSER'
}

// Interface pour la permission d’un rôle
export interface Permission {
  resource: Resource;
  actions: Action[];
}

// Interface principale Role
export interface Role {
  id: number;
  name: RoleName | string; // string pour flexibilité si tu ajoutes des rôles dynamiques
  permissions: Permission[];
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
}
