import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsCdcModalComponent } from './details-cdc-modal.component';

describe('DetailsCdcModalComponent', () => {
  let component: DetailsCdcModalComponent;
  let fixture: ComponentFixture<DetailsCdcModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DetailsCdcModalComponent]
    });
    fixture = TestBed.createComponent(DetailsCdcModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
