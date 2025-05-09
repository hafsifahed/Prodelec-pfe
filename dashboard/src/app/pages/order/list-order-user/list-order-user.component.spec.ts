import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOrderUserComponent } from './list-order-user.component';

describe('ListOrderUserComponent', () => {
  let component: ListOrderUserComponent;
  let fixture: ComponentFixture<ListOrderUserComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListOrderUserComponent]
    });
    fixture = TestBed.createComponent(ListOrderUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
