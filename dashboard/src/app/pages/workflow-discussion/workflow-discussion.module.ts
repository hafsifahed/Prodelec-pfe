// workflow-discussion.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DiscussionViewComponent } from './components/discussion-view/discussion-view.component';
import { WorkflowDiscussionRoutingModule } from './workflow-discussion-routing.module';
import { MessageInputComponent } from './components/discussion-view/message-input/message-input.component';
import { DateFormatPipe } from './pipes/date-format.pipe';

@NgModule({
  declarations: [
    DiscussionViewComponent,
    MessageInputComponent,
    DateFormatPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    WorkflowDiscussionRoutingModule
  ],
  exports: [
    DiscussionViewComponent
  ]
})
export class WorkflowDiscussionModule {}