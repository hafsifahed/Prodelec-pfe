import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowDiscussionsPageComponent } from './workflow-discussions-page.component';

describe('WorkflowDiscussionsPageComponent', () => {
  let component: WorkflowDiscussionsPageComponent;
  let fixture: ComponentFixture<WorkflowDiscussionsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkflowDiscussionsPageComponent]
    });
    fixture = TestBed.createComponent(WorkflowDiscussionsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
