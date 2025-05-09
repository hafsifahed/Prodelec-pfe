import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPartnerComponent } from './edit-partner.component';

describe('EditPartnerComponent', () => {
  let component: EditPartnerComponent;
  let fixture: ComponentFixture<EditPartnerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditPartnerComponent]
    });
    fixture = TestBed.createComponent(EditPartnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
