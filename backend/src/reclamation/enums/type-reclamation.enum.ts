// src/reclamation/enums/type-reclamation.enum.ts
export enum TypeReclamation {
  // Types généraux
  TECHNIQUE = 'TECHNIQUE',
  COMMERCIALE = 'COMMERCIALE',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  AUTRE = 'AUTRE',

  // Détails Produit (TECHNIQUE)
  PRODUIT_NON_FONCTIONNEL = 'Produit non fonctionnel',
  PROBLEMES_DE_QUALITE = 'Problèmes de qualité',
  PRODUITS_ENDOMMAGES_DEFFECTUEUX = 'Produits endommagés ou défectueux',
  ASPECT_NON_CONFORME = 'Aspect non conforme',

  // Détails Service (COMMERCIALE)
  SERVICE_CLIENT_INSATISFAISANT = 'Service client insatisfaisant',
  MANQUE_DOCUMENTS_JOINTS = 'Manque de documents joints au produit',
  ERREURS_DANS_COMMANDES = 'Erreurs dans les commandes',
  INSTALLATION_REPARATION_INSATISFAISANTE = 'Installation ou réparation insatisfaisante',

  // Détails Livraison (ADMINISTRATIVE)
  RETARDS_DE_LIVRAISON = 'Retards de livraison',
  PRODUITS_NON_RECUS = 'Produits non reçus',
  LIVRAISONS_INCORRECTES = 'Livraisons incorrectes',
  EMBALLAGE_INADEQUAT = 'Emballage inadéquat',
  QUANTITE_MANQUANTE = 'Quantité manquante',

  // Détails Facturation (ADMINISTRATIVE)
  ERREURS_DE_FACTURATION = 'Erreurs de facturation',
}
