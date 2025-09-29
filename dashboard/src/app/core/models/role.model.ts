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

export enum Resource {
  USERS = 'users',
  ROLES = 'roles',
  PARTNERS = 'partners',
  SETTINGS = 'settings',
  PRODUCTS = 'products',
  PROJECT = 'project',
  ORDERS = 'orders',
  CAHIER_DES_CHARGES = 'cahier_des_charges',
  CDC_FILES = 'cdc_files',
  DEVIS = 'devis',
  INVENTORY = 'inventory',
  QUALITY = 'quality',
  PRODUCTION = 'production',
  LOGISTICS = 'logistics',
  HR = 'hr',
  FINANCE = 'finance',
  METHOD = 'method',
  AUDIT_LOGS = 'audit_logs',
  SESSIONS = 'sessions',
    RECLAMATIONS = 'reclamation',
  NOTIFICATIONS = 'notification',
  EMAIL='email',
  WORKFLOW_DISCUSSIONS = 'workflow_discussions',
  WORKFLOW_MESSAGES = 'workflow_messages',
}

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
  CLIENT_ADMIN = 'CLIENTADMIN',
  CLIENT_USER = 'CLIENTUSER',
  RESPONSABLE_CONCEPTION = 'Responsable Conception',
  RESPONSABLE_QUALITE = 'Responsable Qualité',
  RESPONSABLE_METHODE = 'Responsable Méthode',
  RESPONSABLE_PRODUCTION = 'Responsable Production',
  RESPONSABLE_LOGISTIQUE = 'Responsable Logistique',
  RESPONSABLE_INDUSTRIALISATION = 'Responsable Industrialisation',
}

export interface Permission {
  resource: Resource;
  actions: Action[];
}

export interface Role {
  id: number;
  name: RoleName | string;
  permissions: Permission[];
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
}