import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditOrderModalComponent } from './edit-order-modal.component';

describe('EditOrderModalComponent', () => {
  let component: EditOrderModalComponent;
  let fixture: ComponentFixture<EditOrderModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditOrderModalComponent]
    });
    fixture = TestBed.createComponent(EditOrderModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
