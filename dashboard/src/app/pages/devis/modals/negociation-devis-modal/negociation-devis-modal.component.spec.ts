import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NegociationDevisModalComponent } from './negociation-devis-modal.component';

describe('NegociationDevisModalComponent', () => {
  let component: NegociationDevisModalComponent;
  let fixture: ComponentFixture<NegociationDevisModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NegociationDevisModalComponent]
    });
    fixture = TestBed.createComponent(NegociationDevisModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
