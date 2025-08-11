import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveDevisAdminModalComponent } from './archive-devis-admin-modal.component';

describe('ArchiveDevisAdminModalComponent', () => {
  let component: ArchiveDevisAdminModalComponent;
  let fixture: ComponentFixture<ArchiveDevisAdminModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ArchiveDevisAdminModalComponent]
    });
    fixture = TestBed.createComponent(ArchiveDevisAdminModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
