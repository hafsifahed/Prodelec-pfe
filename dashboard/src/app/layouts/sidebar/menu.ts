import { MenuItem } from './menu.model';

const r =['ADMIN',
    'SUBADMIN',
    'Processus Management Qualité',
    'Processus Conception ET Développement',
    'Processus Methode',
    'Processus Production',
    'Processus Logistique ET Commerciale',
    'Processus DAF',
    'CLIENTADMIN',
    'CLIENTUSER'
];
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
        id: 4,
        label: 'Cahier des charges',
        icon: 'bx-home-circle',
        link: '/cdc',
          rolePermissions: [ { resource: 'users', actions: ['read' ,'create','update','delete']},],
    },
    {
        id: 44,
        label: 'Cahier des charges',
        icon: 'bx-home-circle',
        link: '/cdcUser',
          rolePermissions: [ { resource: 'users', actions: ['read' ,'create','update','delete']},],
    },
    {
        id: 5,
        label: 'Devis',
        icon: 'bx-home-circle',
        link: '/devis',
          rolePermissions: [ { resource: 'users', actions: ['read' ,'create','update','delete']},],
    },
    {
        id: 21,
        label: 'Devis',
        icon: 'bx-home-circle',
        link: '/devisUser',
          rolePermissions: [ { resource: 'users', actions: ['read' ,'create','update','delete']},],
    },
    {
        id: 6,
        label: 'Commandes',
        icon: 'bx-home-circle',
        link: '/listorder',
        rolePermissions: [ { resource: 'users', actions: ['read' ,'create','update','delete']},],


    },
    {
        id: 6,
        label: 'Commandes',
        icon: 'bx-home-circle',
        link: 'listorderclient',
        rolePermissions: [ { resource: 'users', actions: ['read' ,'create','update','delete']},],


    },
    {
        id: 7,
        label: 'Projets',
        icon: 'bx-home-circle',
        link: '/listproject',
          rolePermissions: [ { resource: 'users', actions: ['read' ,'create','update','delete']},],
    },
    {
        id: 7,
        label: 'Mes Projets',
        icon: 'bx-home-circle',
        link: '/listprojectclient',
          rolePermissions: [ { resource: 'users', actions: ['read' ,'create','update','delete']},],
    },
    {
        id: 7,
        label: 'Tous les Projets',
        icon: 'bx-home-circle',
        link: '/listprojetclientadmin',
          rolePermissions: [ { resource: 'users', actions: ['read' ,'create','update','delete']},],
    },
    
    {
        id: 9,
        label: 'Reclamation',
        icon: 'bx-home-circle',
        link: '/reclamation',
        rolePermissions: [ { resource: 'users', actions: ['read' ,'create','update','delete']},],
     
    },
    {
        id: 10,
        label: 'Reclamation',
        icon: 'bx-home-circle',
        link: '/reclamationUser',
        rolePermissions: [ { resource: 'users', actions: ['read' ,'create','update','delete']},],
     
    },
    /*{
        id:10,
        label: 'add user',
        icon: 'bx-home-circle',
        link: 'add-user',
        roles: ['ADMIN', 'SUBADMIN']

    },
    {
        id:11,
        label: 'add worker',
        icon: 'bx-home-circle',
        link: 'add-worker',
        roles: ['ADMIN', 'SUBADMIN']

    },*/
    {
        id: 40,
        label: 'Utilisateurs',
        icon: 'bx-store',
        rolePermissions: [ { resource: 'users', actions: ['read' ,'create','update','delete']},],
        subItems: [
    {
        id:12,
        label: 'Liste Employee',
        icon: 'bx-home-circle',
        link: 'list-worker',
    },
    {
        id:13,
        label: 'Liste Utilisateurs',
        icon: 'bx-home-circle',
        link: 'list-user',

    },

    {
        id:14,
        label: 'Liste Partenaires',
        icon: 'bx-home-circle',
        link: 'list-partner',

    },
        ]
    },
    {
        id:17,
        label: 'Notifications',
        icon: 'bx-home-circle',
        link: 'list-notifications',
        rolePermissions: [ { resource: 'users', actions: ['read' ,'create','update','delete']},],
    },

    {
        id:19,
        label: 'list Avis',
        icon: 'bx-home-circle',
        link: 'list-avis',
        rolePermissions: [ { resource: 'users', actions: ['read' ,'create','update','delete']},],
    },
    {
         id: 30,
         label: 'Session',
         icon: 'bx-store',
         rolePermissions: [ { resource: 'users', actions: ['read' ,'create','update','delete']},],
         subItems: [
             {
             id:15,
             label: 'Users Session',
             icon: 'bx-home-circle',
             link: 'list-user-session',
             parentId:30,
     
         },
         {
             id:16,
             label: 'Workers Session',
             icon: 'bx-home-circle',
             link: 'list-worker-session',
             parentId:30,
     
         },
         ]
     },
     {
        id: 30,
        label: 'Archive',
        icon: 'bx-store',
        rolePermissions: [ { resource: 'users', actions: ['read' ,'create','update','delete']},],
        subItems: [
            {
            id:15,
            label: 'Archive commandes',
            icon: 'bx-home-circle',
            link: 'archiveorderadminclient',
            parentId:30,
    
        },
        {
            id:16,
            label: 'Archive projets',
            icon: 'bx-home-circle',
            link: 'archiveprojectadminclient',
            parentId:30,
    
        },
        ]
    },



];

