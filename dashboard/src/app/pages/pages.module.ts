import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CollapseModule } from 'ngx-bootstrap/collapse';

import { NgApexchartsModule } from 'ng-apexcharts';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgStepperModule } from 'angular-ng-stepper';
import { SimplebarAngularModule } from 'simplebar-angular';
import { LightboxModule } from 'ngx-lightbox';

import { WidgetModule } from '../shared/widget/widget.module';
import { UIModule } from '../shared/ui/ui.module';

// Emoji Picker
import { PickerModule } from '@ctrl/ngx-emoji-mart';

import { PagesRoutingModule } from './pages-routing.module';
import { NgxPaginationModule } from 'ngx-pagination';




import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { UserComponent } from './users/user/user.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { ProfileComponent } from './profile/profile.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { AddWorkerComponent } from './add-worker/add-worker.component';
import { AddUserComponent } from './add-user/add-user.component';
import { ListWorkersComponent } from './list-workers/list-workers.component';
import { ListUsersComponent } from './list-users/list-users.component';
import { AddPartnerComponent } from './add-partner/add-partner.component';
import { ListPartnerComponent } from './list-partner/list-partner.component';
import { EditPartnerComponent } from './edit-partner/edit-partner.component';
import { EditWorkerComponent } from './edit-worker/edit-worker.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { ListSessionUsersComponent } from './list-session-users/list-session-users.component';
import { ListSessionWorkersComponent } from './list-session-workers/list-session-workers.component';
import { ListNotificationsComponent } from './list-notifications/list-notifications.component';
import { AvisComponent } from './avis/avis.component';
import { ListAvisComponent } from './list-avis/list-avis.component';
import { AddCdCComponent } from './cahierDesCharges/add-cd-c/add-cd-c.component';
import { CDCListUserComponent } from './cahierDesCharges/cdc-list-user/cdc-list-user.component';
import { CDCListAdminComponent } from './cahierDesCharges/cdc-list-admin/cdc-list-admin.component';
import { ReclamationListComponent } from './reclamation/reclamation-list/reclamation-list.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { DevisAdminlistComponent } from './devis/devis-adminlist/devis-adminlist.component';
import { DevisUserlistComponent } from './devis/devis-userlist/devis-userlist.component';
import { ReclamationAdminListComponent } from './reclamation/reclamation-admin-list/reclamation-admin-list.component';
import { CDCListArchiveComponent } from './cahierDesCharges/cdc-list-archive/cdc-list-archive.component';
import { DevisListArchiveComponent } from './devis/devis-list-archive/devis-list-archive.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { ReclamationArchiveListComponent } from './reclamation/reclamation-archive-list/reclamation-archive-list.component';
import { ThreeViewerComponent } from './ThreeDViewer/three-viewer/three-viewer.component';
import { CDCUserlistArchiveComponent } from './cahierDesCharges/cdc-userlist-archive/cdc-userlist-archive.component';
import { ReclamationArchiveUserlistComponent } from './reclamation/reclamation-archive-userlist/reclamation-archive-userlist.component';
import { DevisUserlistArchiveComponent } from './devis/devis-userlist-archive/devis-userlist-archive.component';
import { AddOrderComponent } from './order/add-order/add-order.component';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { ListOrderComponent } from './order/list-order/list-order.component';
import { OrderFileComponent } from './order/order-file/order-file.component';
import { ListOrderUserComponent } from './order/list-order-user/list-order-user.component';
import { ListProjectComponent } from './projectfo/list-project/list-project.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ListProjectUserComponent } from './projectfo/list-project-user/list-project-user.component';
import { ArchiveOrderAdminComponent } from './order/archive-order-admin/archive-order-admin.component';
import { ArchiveOrderUserComponent } from './order/archive-order-user/archive-order-user.component';
import { ArchiveProjectAdminComponent } from './projectfo/archive-project-admin/archive-project-admin.component';
import { ArchiveProjectUserComponent } from './projectfo/archive-project-user/archive-project-user.component';
import { ArchiveProjectAdminCComponent } from './projectfo/archive-project-admin-c/archive-project-admin-c.component';
import { ArchiveOrderAdminCComponent } from './order/archive-order-admin-c/archive-order-admin-c.component';
import { ListProjetUserAdminComponent } from './projectfo/list-projet-user-admin/list-projet-user-admin.component';
import { UserAvisCheckComponent } from './avis/userAvisCheck.component';
import { ProjetDetailComponent } from './projet-detail/projet-detail.component';
import { SettingComponent } from './setting/setting.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { PartnerDetailComponent } from './partner-detail/partner-detail.component';
import { RolesComponent } from './roles/roles.component';

@NgModule({
  declarations: [
    UserComponent,
    DashboardComponent,
    SignInComponent,
    ProfileComponent,
    EditProfileComponent,
    AddWorkerComponent,
    AddUserComponent,
    ListWorkersComponent,
    ListUsersComponent,
    AddPartnerComponent,
    ListPartnerComponent,
    EditPartnerComponent,
    EditWorkerComponent,
    EditUserComponent,
    ListSessionUsersComponent,
    ListSessionWorkersComponent,
    ListNotificationsComponent,
    AvisComponent,
    ListAvisComponent,
    AddCdCComponent,
    CDCListUserComponent,
    CDCListAdminComponent,
    ReclamationListComponent,
    DevisAdminlistComponent,
    DevisUserlistComponent,
    ReclamationAdminListComponent,
    CDCListArchiveComponent,
    DevisListArchiveComponent,
    ReclamationArchiveListComponent,
    ThreeViewerComponent,
    CDCUserlistArchiveComponent,
    ReclamationArchiveUserlistComponent,
    DevisUserlistArchiveComponent,
    AddOrderComponent,
    ListOrderComponent,
    OrderFileComponent,
    ListOrderUserComponent,
    ListProjectComponent,
    ListProjectUserComponent,
    ArchiveOrderAdminComponent,
    ArchiveOrderUserComponent,
    ArchiveProjectAdminComponent,
    ArchiveProjectUserComponent,
    ArchiveProjectAdminCComponent,
    ArchiveOrderAdminCComponent,
    ListProjetUserAdminComponent,
    UserAvisCheckComponent,
    ProjetDetailComponent,
    SettingComponent,
    UserDetailComponent,
    PartnerDetailComponent,
    RolesComponent

  ],
  imports: [
    CommonModule,
    FormsModule,
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    PagesRoutingModule,
    NgApexchartsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgxExtendedPdfViewerModule,
    NgStepperModule,
    HttpClientModule,
    CdkStepperModule,
    UIModule,

    NgxExtendedPdfViewerModule,
    BsDatepickerModule,
    WidgetModule,
    FullCalendarModule,
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    CollapseModule.forRoot(),
    PaginationModule.forRoot(),
    SimplebarAngularModule,
    LightboxModule,
    PickerModule,
    NgxPaginationModule,
    CommonModule
    
  ],
})
export class PagesModule { }
