import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsCdcAdminModalComponent } from './details-cdc-admin-modal.component';

describe('DetailsCdcAdminModalComponent', () => {
  let component: DetailsCdcAdminModalComponent;
  let fixture: ComponentFixture<DetailsCdcAdminModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DetailsCdcAdminModalComponent]
    });
    fixture = TestBed.createComponent(DetailsCdcAdminModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
