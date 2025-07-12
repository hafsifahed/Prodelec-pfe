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

    // New responsible roles
    RESPONSABLE_CONCEPTION = 'Responsable Conception',
    RESPONSABLE_QUALITE = 'Responsable Qualité',
    RESPONSABLE_METHODE = 'Responsable Méthode',
    RESPONSABLE_PRODUCTION = 'Responsable Production',
    RESPONSABLE_LOGISTIQUE = 'Responsable Logistique',

    // Client roles
    CLIENT_ADMIN = 'CLIENTADMIN',
    CLIENT_USER = 'CLIENTUSER'
}
