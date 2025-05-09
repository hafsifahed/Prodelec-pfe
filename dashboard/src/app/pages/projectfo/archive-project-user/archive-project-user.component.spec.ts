import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveProjectUserComponent } from './archive-project-user.component';

describe('ArchiveProjectUserComponent', () => {
  let component: ArchiveProjectUserComponent;
  let fixture: ComponentFixture<ArchiveProjectUserComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ArchiveProjectUserComponent]
    });
    fixture = TestBed.createComponent(ArchiveProjectUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
