// workflow-discussion-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DiscussionViewComponent } from './components/discussion-view/discussion-view.component';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { DiscussionListComponent } from './discussion-list/discussion-list.component';
import { WorkflowDiscussionsPageComponent } from './workflow-discussions-page/workflow-discussions-page.component';

const routes: Routes = [
    {
    path: '',
    component: WorkflowDiscussionsPageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: ':id',
    component: WorkflowDiscussionsPageComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowDiscussionRoutingModule {}