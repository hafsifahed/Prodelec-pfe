import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefuseDevisModalComponent } from './refuse-devis-modal.component';

describe('RefuseDevisModalComponent', () => {
  let component: RefuseDevisModalComponent;
  let fixture: ComponentFixture<RefuseDevisModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RefuseDevisModalComponent]
    });
    fixture = TestBed.createComponent(RefuseDevisModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
