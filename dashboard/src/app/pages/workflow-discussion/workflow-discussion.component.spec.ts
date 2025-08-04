import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowDiscussionComponent } from './workflow-discussion.component';

describe('WorkflowDiscussionComponent', () => {
  let component: WorkflowDiscussionComponent;
  let fixture: ComponentFixture<WorkflowDiscussionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkflowDiscussionComponent]
    });
    fixture = TestBed.createComponent(WorkflowDiscussionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
