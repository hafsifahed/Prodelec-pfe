import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveProjectAdminCComponent } from './archive-project-admin-c.component';

describe('ArchiveProjectAdminCComponent', () => {
  let component: ArchiveProjectAdminCComponent;
  let fixture: ComponentFixture<ArchiveProjectAdminCComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ArchiveProjectAdminCComponent]
    });
    fixture = TestBed.createComponent(ArchiveProjectAdminCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
