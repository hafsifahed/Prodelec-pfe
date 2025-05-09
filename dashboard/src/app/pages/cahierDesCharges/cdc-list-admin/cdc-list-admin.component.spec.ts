import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CDCListAdminComponent } from './cdc-list-admin.component';

describe('CDCListAdminComponent', () => {
  let component: CDCListAdminComponent;
  let fixture: ComponentFixture<CDCListAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CDCListAdminComponent]
    });
    fixture = TestBed.createComponent(CDCListAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
