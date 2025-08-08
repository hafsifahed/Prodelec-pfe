import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowDetailsSidebarComponent } from './workflow-details-sidebar.component';

describe('WorkflowDetailsSidebarComponent', () => {
  let component: WorkflowDetailsSidebarComponent;
  let fixture: ComponentFixture<WorkflowDetailsSidebarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkflowDetailsSidebarComponent]
    });
    fixture = TestBed.createComponent(WorkflowDetailsSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
