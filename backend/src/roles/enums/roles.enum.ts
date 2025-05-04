// roles.enum.ts
export enum Role {
    // System-wide roles
    ADMIN = 'ADMIN',
    SUBADMIN = 'SUBADMIN',
    
    // Process-specific roles
    PROCESS_QUALITY = 'Processus Management Qualité',
    PROCESS_DESIGN = 'Processus Conception ET Développement',
    PROCESS_METHOD = 'Processus Méthode',
    PROCESS_PRODUCTION = 'Processus Production',
    PROCESS_LOGISTICS = 'Processus Logistique ET Commerciale',
    PROCESS_DAF = 'Processus DAF',
    PROCESS_RH = 'Processus Rh',

    
    // Client roles
    CLIENT_ADMIN = 'clientadmin',
    CLIENT_USER = 'clientuser'
  }
  