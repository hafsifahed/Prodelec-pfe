import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevisUserlistComponent } from './devis-userlist.component';

describe('DevisUserlistComponent', () => {
  let component: DevisUserlistComponent;
  let fixture: ComponentFixture<DevisUserlistComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DevisUserlistComponent]
    });
    fixture = TestBed.createComponent(DevisUserlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
