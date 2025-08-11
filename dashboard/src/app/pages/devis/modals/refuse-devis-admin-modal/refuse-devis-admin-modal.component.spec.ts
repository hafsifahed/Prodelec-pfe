import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefuseDevisAdminModalComponent } from './refuse-devis-admin-modal.component';

describe('RefuseDevisAdminModalComponent', () => {
  let component: RefuseDevisAdminModalComponent;
  let fixture: ComponentFixture<RefuseDevisAdminModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RefuseDevisAdminModalComponent]
    });
    fixture = TestBed.createComponent(RefuseDevisAdminModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
