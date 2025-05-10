import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';



import { UserComponent } from './users/user/user.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import {ProfileComponent} from "./profile/profile.component";
import {EditProfileComponent} from "./edit-profile/edit-profile.component";
import {AddUserComponent} from "./add-user/add-user.component";
import {AddWorkerComponent} from "./add-worker/add-worker.component";
import {ListUsersComponent} from "./list-users/list-users.component";
import {ListWorkersComponent} from "./list-workers/list-workers.component";
import {ListPartnerComponent} from "./list-partner/list-partner.component";
import {AddPartnerComponent} from "./add-partner/add-partner.component";
import {EditUserComponent} from "./edit-user/edit-user.component";
import {EditWorkerComponent} from "./edit-worker/edit-worker.component";
import {EditPartnerComponent} from "./edit-partner/edit-partner.component";
import {ListSessionUsersComponent} from "./list-session-users/list-session-users.component";
import {ListSessionWorkersComponent} from "./list-session-workers/list-session-workers.component";
import {ListNotificationsComponent} from "./list-notifications/list-notifications.component";
import {AvisComponent} from "./avis/avis.component";
import {ListAvisComponent} from "./list-avis/list-avis.component";
import { C } from '@fullcalendar/core/internal-common';
import { CDCListUserComponent } from './cahierDesCharges/cdc-list-user/cdc-list-user.component';
import { AddCdCComponent } from './cahierDesCharges/add-cd-c/add-cd-c.component';
import { CDCListAdminComponent } from './cahierDesCharges/cdc-list-admin/cdc-list-admin.component';
import { ReclamationListComponent } from './reclamation/reclamation-list/reclamation-list.component';
import { DevisAdminlistComponent } from './devis/devis-adminlist/devis-adminlist.component';
import { DevisUserlistComponent } from './devis/devis-userlist/devis-userlist.component';
import { ReclamationAdminListComponent } from './reclamation/reclamation-admin-list/reclamation-admin-list.component';
import { CDCListArchiveComponent } from './cahierDesCharges/cdc-list-archive/cdc-list-archive.component';
import { DevisListArchiveComponent } from './devis/devis-list-archive/devis-list-archive.component';
import { ReclamationArchiveListComponent } from './reclamation/reclamation-archive-list/reclamation-archive-list.component';
import { ThreeViewerComponent } from './ThreeDViewer/three-viewer/three-viewer.component';
import { CDCUserlistArchiveComponent } from './cahierDesCharges/cdc-userlist-archive/cdc-userlist-archive.component';
import { DevisUserlistArchiveComponent } from './devis/devis-userlist-archive/devis-userlist-archive.component';
import { ReclamationArchiveUserlistComponent } from './reclamation/reclamation-archive-userlist/reclamation-archive-userlist.component';
import { AddOrderComponent } from './order/add-order/add-order.component';
import { ListOrderComponent } from './order/list-order/list-order.component';
import { OrderFileComponent } from './order/order-file/order-file.component';
import { ListOrderUserComponent } from './order/list-order-user/list-order-user.component';
import { ListProjectComponent } from './projectfo/list-project/list-project.component';
import { ListProjectUserComponent } from './projectfo/list-project-user/list-project-user.component';
import { ArchiveOrderAdminComponent } from './order/archive-order-admin/archive-order-admin.component';
import { ArchiveOrderUserComponent } from './order/archive-order-user/archive-order-user.component';
import { ArchiveProjectAdminComponent } from './projectfo/archive-project-admin/archive-project-admin.component';
import { ArchiveProjectUserComponent } from './projectfo/archive-project-user/archive-project-user.component';
import { ArchiveProjectAdminCComponent } from './projectfo/archive-project-admin-c/archive-project-admin-c.component';
import { ArchiveOrderAdminCComponent } from './order/archive-order-admin-c/archive-order-admin-c.component';
import { ListProjetUserAdminComponent } from './projectfo/list-projet-user-admin/list-projet-user-admin.component';



const routes: Routes = [
  // { path: '', redirectTo: 'dashboard' },
  {
    path: "",
    component: DashboardComponent,
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,

  }
  ,
 { path: 'profile', component: ProfileComponent},
   { path: 'edit-profile', component: EditProfileComponent },
  { path: 'add-user', component: AddUserComponent  },
  { path: 'edit-user/:id', component: EditUserComponent  },

  { path: 'add-worker', component: AddWorkerComponent  },
  { path: 'edit-worker/:id', component: EditWorkerComponent  },

  { path: 'add-partner', component: AddPartnerComponent  },
  { path: 'edit-partner/:id', component: EditPartnerComponent  },


  { path: 'list-user', component: ListUsersComponent  },

  { path: 'list-worker', component: ListWorkersComponent  },
  { path: 'list-partner', component: ListPartnerComponent  },
  { path: 'list-worker-session', component: ListSessionWorkersComponent  },
  { path: 'list-user-session', component: ListSessionUsersComponent  },
  { path: 'list-notifications', component: ListNotificationsComponent },

  { path: 'avis', component: AvisComponent ,    },
  { path: 'list-avis', component: ListAvisComponent   },


  { path: 'user', component: UserComponent },

  { path: 'cdc', component: CDCListAdminComponent  },
  { path: 'cdcUser', component: CDCListUserComponent,   },
  {path: 'cdcUser/cdcAdd', component: AddCdCComponent,   },
  {path: 'reclamation', component:ReclamationAdminListComponent  },
  {path: 'reclamationUser', component:ReclamationListComponent,   },
  {path: 'devis', component:DevisAdminlistComponent  },
  {path:'devisUser', component:DevisUserlistComponent,  },
  {path: 'cdc/cdcArchive', component: CDCListArchiveComponent  },
  {path: 'devis/devisArchive', component: DevisListArchiveComponent  },
  {path: 'reclamation/reclamationArchive', component: ReclamationArchiveListComponent  },
  {path: 'cdcUser/cdcArchive', component: CDCUserlistArchiveComponent,   },
  {path: 'devisUser/devisArchive', component: DevisUserlistArchiveComponent ,  },
  {path: 'reclamationUser/reclamationArchive', component: ReclamationArchiveUserlistComponent ,  },
  { path: 'addorder', component: AddOrderComponent ,  },
  { path: 'listorder', component: ListOrderComponent  },
  { path: 'file/:filename/:ido', component: OrderFileComponent },
  { path: 'listorderclient', component: ListOrderUserComponent,   },
  { path: 'listproject', component: ListProjectComponent  },
  { path: 'listprojectclient', component: ListProjectUserComponent ,  },
  { path: 'archiveorderadmin', component: ArchiveOrderAdminComponent  },
  { path: 'archiveorderclient', component: ArchiveOrderUserComponent ,  },
  { path: 'archiveprojectadmin', component: ArchiveProjectAdminComponent  },
  { path: 'archiveprojectclient', component: ArchiveProjectUserComponent,   },
  { path: 'listprojetclientadmin', component: ListProjetUserAdminComponent },
  { path: 'archiveprojectadminclient', component: ArchiveProjectAdminCComponent  },
  { path: 'archiveorderadminclient', component: ArchiveOrderAdminCComponent  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
