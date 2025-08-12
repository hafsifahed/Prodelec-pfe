import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectPhaseDetailsModalComponent } from './project-phase-details-modal.component';

describe('ProjectPhaseDetailsModalComponent', () => {
  let component: ProjectPhaseDetailsModalComponent;
  let fixture: ComponentFixture<ProjectPhaseDetailsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectPhaseDetailsModalComponent]
    });
    fixture = TestBed.createComponent(ProjectPhaseDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
