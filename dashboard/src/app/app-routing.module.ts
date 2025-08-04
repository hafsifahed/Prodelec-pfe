import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LayoutComponent } from './layouts/layout.component';
import { CyptolandingComponent } from './cyptolanding/cyptolanding.component';
import { Page404Component } from './extrapages/page404/page404.component';
import {SignInComponent} from "./pages/sign-in/sign-in.component";
import { AuthGuard } from './core/guards/auth.guard';
import { NoAuthGuard } from './core/guards/no-auth.guard';

const routes: Routes = [

  // tslint:disable-next-line: max-line-length
  { 
    // account
    path: '', 
    component: LayoutComponent, 
    loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule),
    canActivate:[AuthGuard]

  },
  {
        path: 'workflow-discussions',
        loadChildren: () => import('./pages/workflow-discussion/workflow-discussion.module')
          .then(m => m.WorkflowDiscussionModule),
       // canActivate: [AuthGuard],
      }
  ,
  { path: '', loadChildren: () => import('./extrapages/extrapages.module').then(m => m.ExtrapagesModule) },
  { path: 'home', component: CyptolandingComponent },
  { path: 'signin', component: SignInComponent,canActivate:[NoAuthGuard] },

  { path: '**', component: Page404Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})

export class AppRoutingModule { }
