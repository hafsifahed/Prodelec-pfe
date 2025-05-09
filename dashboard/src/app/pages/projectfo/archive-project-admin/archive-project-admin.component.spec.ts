import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveProjectAdminComponent } from './archive-project-admin.component';

describe('ArchiveProjectAdminComponent', () => {
  let component: ArchiveProjectAdminComponent;
  let fixture: ComponentFixture<ArchiveProjectAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ArchiveProjectAdminComponent]
    });
    fixture = TestBed.createComponent(ArchiveProjectAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
