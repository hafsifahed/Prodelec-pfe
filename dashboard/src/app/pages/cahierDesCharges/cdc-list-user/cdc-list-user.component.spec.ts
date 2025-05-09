import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CDCListUserComponent } from './cdc-list-user.component';

describe('CDCListUserComponent', () => {
  let component: CDCListUserComponent;
  let fixture: ComponentFixture<CDCListUserComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CDCListUserComponent]
    });
    fixture = TestBed.createComponent(CDCListUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
