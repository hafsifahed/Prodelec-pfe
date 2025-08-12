import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectEditModalComponent } from './project-edit-modal.component';

describe('ProjectEditModalComponent', () => {
  let component: ProjectEditModalComponent;
  let fixture: ComponentFixture<ProjectEditModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectEditModalComponent]
    });
    fixture = TestBed.createComponent(ProjectEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
