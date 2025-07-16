import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectCalendarAdminComponent } from './project-calendar-admin.component';

describe('ProjectCalendarAdminComponent', () => {
  let component: ProjectCalendarAdminComponent;
  let fixture: ComponentFixture<ProjectCalendarAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectCalendarAdminComponent]
    });
    fixture = TestBed.createComponent(ProjectCalendarAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
