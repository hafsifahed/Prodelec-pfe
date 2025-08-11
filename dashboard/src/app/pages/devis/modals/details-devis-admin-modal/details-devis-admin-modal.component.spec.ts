import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsDevisAdminModalComponent } from './details-devis-admin-modal.component';

describe('DetailsDevisAdminModalComponent', () => {
  let component: DetailsDevisAdminModalComponent;
  let fixture: ComponentFixture<DetailsDevisAdminModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DetailsDevisAdminModalComponent]
    });
    fixture = TestBed.createComponent(DetailsDevisAdminModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
