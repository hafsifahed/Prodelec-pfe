import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveOrderAdminComponent } from './archive-order-admin.component';

describe('ArchiveOrderAdminComponent', () => {
  let component: ArchiveOrderAdminComponent;
  let fixture: ComponentFixture<ArchiveOrderAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ArchiveOrderAdminComponent]
    });
    fixture = TestBed.createComponent(ArchiveOrderAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
