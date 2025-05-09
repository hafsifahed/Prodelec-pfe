import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevisAdminlistComponent } from './devis-adminlist.component';

describe('DevisAdminlistComponent', () => {
  let component: DevisAdminlistComponent;
  let fixture: ComponentFixture<DevisAdminlistComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DevisAdminlistComponent]
    });
    fixture = TestBed.createComponent(DevisAdminlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
