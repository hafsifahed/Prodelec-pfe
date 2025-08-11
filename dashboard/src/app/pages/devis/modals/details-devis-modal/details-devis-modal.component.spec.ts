import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsDevisModalComponent } from './details-devis-modal.component';

describe('DetailsDevisModalComponent', () => {
  let component: DetailsDevisModalComponent;
  let fixture: ComponentFixture<DetailsDevisModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DetailsDevisModalComponent]
    });
    fixture = TestBed.createComponent(DetailsDevisModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
