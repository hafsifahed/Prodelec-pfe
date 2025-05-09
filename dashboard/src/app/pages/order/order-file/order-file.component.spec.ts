import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderFileComponent } from './order-file.component';

describe('OrderFileComponent', () => {
  let component: OrderFileComponent;
  let fixture: ComponentFixture<OrderFileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrderFileComponent]
    });
    fixture = TestBed.createComponent(OrderFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
