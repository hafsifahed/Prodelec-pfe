// workflow-discussion.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DiscussionViewComponent } from './components/discussion-view/discussion-view.component';
import { WorkflowDiscussionRoutingModule } from './workflow-discussion-routing.module';
import { MessageInputComponent } from './components/discussion-view/message-input/message-input.component';
import { DateFormatPipe } from './pipes/date-format.pipe';
import { DiscussionListComponent } from './discussion-list/discussion-list.component';
import { WorkflowDiscussionsPageComponent } from './workflow-discussions-page/workflow-discussions-page.component';
import { WorkflowDetailsSidebarComponent } from './workflow-details-sidebar/workflow-details-sidebar.component';
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
  declarations: [
    DiscussionViewComponent,
    MessageInputComponent,
    DateFormatPipe,
    DiscussionListComponent,
    WorkflowDiscussionsPageComponent,
    WorkflowDetailsSidebarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    WorkflowDiscussionRoutingModule,
        ModalModule.forRoot()

  ],
  exports: [
    DiscussionViewComponent
  ]
})
export class WorkflowDiscussionModule {}