import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDevisModalComponent } from './add-devis-modal.component';

describe('AddDevisModalComponent', () => {
  let component: AddDevisModalComponent;
  let fixture: ComponentFixture<AddDevisModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddDevisModalComponent]
    });
    fixture = TestBed.createComponent(AddDevisModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
