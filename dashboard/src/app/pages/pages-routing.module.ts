import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { ProfileComponent } from "./profile/profile.component";
import { EditProfileComponent } from "./edit-profile/edit-profile.component";

// Users / Workers
import { AddUserComponent } from "./add-user/add-user.component";
import { EditUserComponent } from "./edit-user/edit-user.component";
import { ListUsersComponent } from "./list-users/list-users.component";
import { AddWorkerComponent } from "./add-worker/add-worker.component";
import { EditWorkerComponent } from "./edit-worker/edit-worker.component";
import { ListWorkersComponent } from "./list-workers/list-workers.component";

// Partners
import { AddPartnerComponent } from "./add-partner/add-partner.component";
import { EditPartnerComponent } from "./edit-partner/edit-partner.component";
import { ListPartnerComponent } from "./list-partner/list-partner.component";

// Sessions
import { ListSessionUsersComponent } from "./list-session-users/list-session-users.component";
import { ListSessionWorkersComponent } from "./list-session-workers/list-session-workers.component";

// Notifications
import { ListNotificationsComponent } from "./list-notifications/list-notifications.component";

// Avis
import { AvisComponent } from "./avis/avis.component";
import { ListAvisComponent } from "./list-avis/list-avis.component";

// Cahier des charges
import { CDCListAdminComponent } from './cahierDesCharges/cdc-list-admin/cdc-list-admin.component';
import { CDCListUserComponent } from './cahierDesCharges/cdc-list-user/cdc-list-user.component';
import { AddCdCComponent } from './cahierDesCharges/modals/add-cd-c/add-cd-c.component';
import { CDCListArchiveComponent } from './cahierDesCharges/cdc-list-archive/cdc-list-archive.component';
import { CDCUserlistArchiveComponent } from './cahierDesCharges/cdc-userlist-archive/cdc-userlist-archive.component';

// Devis
import { DevisAdminlistComponent } from './devis/devis-adminlist/devis-adminlist.component';
import { DevisUserlistComponent } from './devis/devis-userlist/devis-userlist.component';
import { DevisListArchiveComponent } from './devis/devis-list-archive/devis-list-archive.component';
import { DevisUserlistArchiveComponent } from './devis/devis-userlist-archive/devis-userlist-archive.component';

// Reclamations
import { ReclamationAdminListComponent } from './reclamation/reclamation-admin-list/reclamation-admin-list.component';
import { ReclamationListComponent } from './reclamation/reclamation-list/reclamation-list.component';
import { ReclamationArchiveListComponent } from './reclamation/reclamation-archive-list/reclamation-archive-list.component';
import { ReclamationArchiveUserlistComponent } from './reclamation/reclamation-archive-userlist/reclamation-archive-userlist.component';

// Orders
import { AddOrderComponent } from './order/add-order/add-order.component';
import { ListOrderComponent } from './order/list-order/list-order.component';
import { ListOrderUserComponent } from './order/list-order-user/list-order-user.component';
import { ArchiveOrderAdminComponent } from './order/archive-order-admin/archive-order-admin.component';
import { ArchiveOrderUserComponent } from './order/archive-order-user/archive-order-user.component';
import { ArchiveOrderAdminCComponent } from './order/archive-order-admin-c/archive-order-admin-c.component';

// Projects
import { ListProjectComponent } from './projectfo/list-project/list-project.component';
import { ListProjectUserComponent } from './projectfo/list-project-user/list-project-user.component';
import { ProjetDetailComponent } from './projet-detail/projet-detail.component';
import { ArchiveProjectAdminComponent } from './projectfo/archive-project-admin/archive-project-admin.component';
import { ArchiveProjectUserComponent } from './projectfo/archive-project-user/archive-project-user.component';
import { ArchiveProjectAdminCComponent } from './projectfo/archive-project-admin-c/archive-project-admin-c.component';
import { ListProjetUserAdminComponent } from './projectfo/list-projet-user-admin/list-projet-user-admin.component';

// Roles / Settings / Details / Calendar / BulkEmail
import { RolesComponent } from './roles/roles.component';
import { SettingComponent } from './setting/setting.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { PartnerDetailComponent } from './partner-detail/partner-detail.component';
import { ProjectCalendarComponent } from './project-calendar/project-calendar.component';
import { ProjectCalendarAdminComponent } from './project-calendar-admin/project-calendar-admin.component';
import { BulkEmailComponent } from './bulk-email/bulk-email.component';

// Guards & Models
import { PermissionGuard } from '../core/guards/permission.guard';
import { RoleGuard } from '../core/guards/role.guard';
import { Action, Resource } from '../core/models/role.model';
import { AvisGuard } from '../core/guards/avis.guard';
import { ClientAdminGuard } from '../core/guards/clientadmin.guard';

const routes: Routes = [
  { 
    path: "", 
    redirectTo: "dashboard", 
    pathMatch: 'full',
    data: { title: 'Tableau de bord | Prodelec NA' }
  },
  { 
    path: "dashboard", 
    component: DashboardComponent,
    data: { title: 'Tableau de bord | Prodelec NA' }
  },

  { 
    path: "profile", 
    component: ProfileComponent,
    data: { title: 'Profil | Prodelec NA' }
  },
  { 
    path: "edit-profile", 
    component: EditProfileComponent,
    data: { title: 'Modifier le profil | Prodelec NA' }
  },

  // === USERS ===
  { 
    path: "add-user", 
    component: AddUserComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.USERS, actions: [Action.CREATE,Action.MANAGE] }], 
      allowedRoles: ['WORKER'],
      title: 'Ajouter un utilisateur | Prodelec NA'
    } 
  },
  { 
    path: "edit-user/:id", 
    component: EditUserComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.USERS, actions: [Action.UPDATE,Action.MANAGE] }], 
      allowedRoles: ['WORKER'],
      title: 'Modifier un utilisateur | Prodelec NA'
    } 
  },
  { 
    path: "list-user", 
    component: ListUsersComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.USERS, actions: [Action.READ,Action.MANAGE] }], 
      //allowedRoles: ['WORKER'],
      title: 'Liste des utilisateurs | Prodelec NA'
    } 
  },

  // === WORKERS ===
  { 
    path: "add-worker", 
    component: AddWorkerComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.USERS, actions: [Action.CREATE,Action.MANAGE] }], 
      allowedRoles: ['WORKER'],
      title: 'Ajouter un travailleur | Prodelec NA'
    } 
  },
  { 
    path: "edit-worker/:id", 
    component: EditWorkerComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.USERS, actions: [Action.UPDATE,Action.MANAGE] }], 
      allowedRoles: ['WORKER'],
      title: 'Modifier un travailleur | Prodelec NA'
    } 
  },
  { 
    path: "list-worker", 
    component: ListWorkersComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.USERS, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['WORKER'],
      title: 'Liste des travailleurs | Prodelec NA'
    } 
  },

  // === PARTNERS ===
  { 
    path: "add-partner", 
    component: AddPartnerComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.PARTNERS, actions: [Action.CREATE,Action.MANAGE] }], 
      allowedRoles: ['WORKER'],
      title: 'Ajouter un partenaire | Prodelec NA'
    } 
  },
  { 
    path: "edit-partner/:id", 
    component: EditPartnerComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.PARTNERS, actions: [Action.UPDATE,Action.MANAGE] }], 
      allowedRoles: ['WORKER'],
      title: 'Modifier un partenaire | Prodelec NA'
    } 
  },
  { 
    path: "list-partner", 
    component: ListPartnerComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.PARTNERS, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['WORKER'],
      title: 'Liste des partenaires | Prodelec NA'
    } 
  },

  // === SESSIONS ===
 /* { 
    path: "list-worker-session", 
    component: ListSessionWorkersComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.SESSIONS, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['WORKER'],
      title: 'Sessions des travailleurs | Prodelec NA'
    } 
  },*/
  { 
    path: "list-user-session", 
    component: ListSessionUsersComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.SESSIONS, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['WORKER'],
      title: 'Sessions des utilisateurs | Prodelec NA'
    } 
  },

  // === NOTIFICATIONS ===
  { 
    path: "list-notifications", 
    component: ListNotificationsComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.NOTIFICATIONS, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['CLIENT','WORKER'],
      title: 'Notifications | Prodelec NA'
    } 
  },

  // === AVIS ===
  { 
    path: "avis", 
    component: AvisComponent, 
    canActivate: [PermissionGuard, RoleGuard, AvisGuard], 
    data: { 
      permissions: [{ resource: Resource.QUALITY, actions: [Action.CREATE,Action.MANAGE] }], 
      allowedRoles: ['CLIENT'],
      title: 'Donner un avis | Prodelec NA'
    } 
  },
  { 
    path: "list-avis", 
    component: ListAvisComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.QUALITY, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['WORKER'],
      title: 'Liste des avis | Prodelec NA'
    } 
  },

  // === CAHIER DES CHARGES ===
  { 
    path: "cdc", 
    component: CDCListAdminComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.CAHIER_DES_CHARGES, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['WORKER'],
      title: 'Cahiers des charges | Prodelec NA'
    } 
  },
  { 
    path: "cdcUser", 
    component: CDCListUserComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      allowedRoles: ['CLIENT'],
      title: 'Mes cahiers des charges | Prodelec NA'
    } 
  },
  { 
    path: "cdcUser/cdcAdd", 
    component: AddCdCComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.CAHIER_DES_CHARGES, actions: [Action.CREATE,Action.MANAGE] }], 
      allowedRoles: ['CLIENT'],
      title: 'Ajouter un cahier des charges | Prodelec NA'
    } 
  },
  { 
    path: "cdc/cdcArchive", 
    component: CDCListArchiveComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.CAHIER_DES_CHARGES, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['WORKER'],
      title: 'Cahiers des charges archivés | Prodelec NA'
    } 
  },
  { 
    path: "cdcUser/cdcArchive", 
    component: CDCUserlistArchiveComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.CAHIER_DES_CHARGES, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['CLIENT'],
      title: 'Mes cahiers archivés | Prodelec NA'
    } 
  },

  // === DEVIS ===
  { 
    path: "devis", 
    component: DevisAdminlistComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.DEVIS, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['WORKER'],
      title: 'Devis | Prodelec NA'
    } 
  },
  { 
    path: "devisUser", 
    component: DevisUserlistComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.DEVIS, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['CLIENT'],
      title: 'Mes devis | Prodelec NA'
    } 
  },
  { 
    path: "devis/devisArchive", 
    component: DevisListArchiveComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.DEVIS, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['WORKER'],
      title: 'Devis archivés | Prodelec NA'
    } 
  },
  { 
    path: "devisUser/devisArchive", 
    component: DevisUserlistArchiveComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.DEVIS, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['CLIENT'],
      title: 'Mes devis archivés | Prodelec NA'
    } 
  },

  // === RECLAMATIONS ===
  { 
    path: "reclamation", 
    component: ReclamationAdminListComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.RECLAMATIONS, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['WORKER'],
      title: 'Réclamations | Prodelec NA'
    } 
  },
  { 
    path: "reclamationUser", 
    component: ReclamationListComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.RECLAMATIONS, actions: [Action.CREATE, Action.READ,Action.MANAGE] }], 
      allowedRoles: ['CLIENT'],
      title: 'Mes réclamations | Prodelec NA'
    } 
  },
  { 
    path: "reclamation/reclamationArchive", 
    component: ReclamationArchiveListComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.RECLAMATIONS, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['WORKER'],
      title: 'Réclamations archivées | Prodelec NA'
    } 
  },
  { 
    path: "reclamationUser/reclamationArchive", 
    component: ReclamationArchiveUserlistComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.RECLAMATIONS, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['CLIENT'],
      title: 'Mes réclamations archivées | Prodelec NA'
    } 
  },

  // === ORDERS ===
  { 
    path: "addorder", 
    component: AddOrderComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.ORDERS, actions: [Action.CREATE,Action.MANAGE] }], 
      allowedRoles: ['CLIENT'],
      title: 'Créer une commande | Prodelec NA'
    } 
  },
  { 
    path: "listorder", 
    component: ListOrderComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.ORDERS, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['WORKER'],
      title: 'Liste des commandes | Prodelec NA'
    } 
  },
  { 
    path: "listorderclient", 
    component: ListOrderUserComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.ORDERS, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['CLIENT'],
      title: 'Mes commandes | Prodelec NA'
    } 
  },
  { 
    path: "archiveorderadmin", 
    component: ArchiveOrderAdminComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.ORDERS, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['WORKER'],
      title: 'Commandes archivées | Prodelec NA'
    } 
  },
  { 
    path: "archiveorderclient", 
    component: ArchiveOrderUserComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.ORDERS, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['CLIENT'],
      title: 'Mes commandes archivées | Prodelec NA'
    } 
  },
  { 
    path: "archiveorderadminclient", 
    component: ArchiveOrderAdminCComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.ORDERS, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['CLIENT','WORKER'],
      title: 'Commandes archivées | Prodelec NA'
    } 
  },

  // === PROJECTS ===
  { 
    path: "listproject", 
    component: ListProjectComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.PROJECT, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['WORKER'],
      title: 'Liste des projets | Prodelec NA'
    } 
  },
  { 
    path: "listproject/:id", 
    component: ProjetDetailComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.PROJECT, actions: [Action.READ,Action.MANAGE] }], 
     // allowedRoles: ['WORKER'],
      title: 'Détail du projet | Prodelec NA'
    } 
  },
  { 
    path: "listprojectclient", 
    component: ListProjectUserComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.PROJECT, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['CLIENT'],
      title: 'Mes projets | Prodelec NA'
    } 
  },
  { 
    path: "archiveprojectadmin", 
    component: ArchiveProjectAdminComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.PROJECT, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['WORKER'],
      title: 'Projets archivés | Prodelec NA'
    } 
  },
  { 
    path: "archiveprojectclient", 
    component: ArchiveProjectUserComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.PROJECT, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['CLIENT'],
      title: 'Mes projets archivés | Prodelec NA'
    } 
  },
  { 
    path: "archiveprojectadminclient", 
    component: ArchiveProjectAdminCComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.PROJECT, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['CLIENT','WORKER'],
      title: 'Projets archivés | Prodelec NA'
    } 
  },
  { 
    path: "listprojetclientadmin", 
    component: ListProjetUserAdminComponent, 
    canActivate: [PermissionGuard, RoleGuard,ClientAdminGuard], 
    data: { 
      permissions: [{ resource: Resource.PROJECT, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['CLIENT'],
      title: 'Projets clients | Prodelec NA'
    } 
  },

  // === ROLES / SETTINGS ===
  { 
    path: "roles", 
    component: RolesComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.QUALITY, actions: [Action.MANAGE] }], 
      allowedRoles: ['WORKER'],
      title: 'Rôles et permissions | Prodelec NA'
    } 
  },
  { 
    path: "setting", 
    component: SettingComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.SETTINGS, actions: [Action.MANAGE,Action.READ,Action.UPDATE] }], 
      allowedRoles: ['CLIENT','WORKER'],
      title: 'Paramètres | Prodelec NA'
    } 
  },

  // === DETAILS ===
  { 
    path: "user/:id", 
    component: UserDetailComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.USERS, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['WORKER'],
      title: 'Détail utilisateur | Prodelec NA'
    } 
  },
  { 
    path: "partner/:id", 
    component: PartnerDetailComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.PARTNERS, actions: [Action.READ,Action.MANAGE] }], 
      allowedRoles: ['WORKER'],
      title: 'Détail partenaire | Prodelec NA'
    } 
  },

  // === CALENDAR ===
  { 
    path: "calendrier", 
    component: ProjectCalendarComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.PROJECT, actions: [Action.READ,Action.MANAGE] }], 
      title: 'Calendrier des projets | Prodelec NA'
    } 
  },
  { 
    path: "calendrierGlobal", 
    component: ProjectCalendarAdminComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.PROJECT, actions: [Action.READ,Action.MANAGE,Action.CREATE,,Action.UPDATE] }], 
      allowedRoles: ['WORKER'],
      title: 'Calendrier global | Prodelec NA'
    } 
  },

  // === BULK EMAIL ===
  { 
    path: "bulk-email", 
    component: BulkEmailComponent, 
    canActivate: [PermissionGuard, RoleGuard], 
    data: { 
      permissions: [{ resource: Resource.QUALITY, actions: [Action.CREATE, Action.MANAGE] }], 
      allowedRoles: ['WORKER'],
      title: 'Email en masse | Prodelec NA'
    } 
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }