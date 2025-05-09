import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveOrderAdminCComponent } from './archive-order-admin-c.component';

describe('ArchiveOrderAdminCComponent', () => {
  let component: ArchiveOrderAdminCComponent;
  let fixture: ComponentFixture<ArchiveOrderAdminCComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ArchiveOrderAdminCComponent]
    });
    fixture = TestBed.createComponent(ArchiveOrderAdminCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
