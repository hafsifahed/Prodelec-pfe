import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefuseCdcModalComponent } from './refuse-cdc-modal.component';

describe('RefuseCdcModalComponent', () => {
  let component: RefuseCdcModalComponent;
  let fixture: ComponentFixture<RefuseCdcModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RefuseCdcModalComponent]
    });
    fixture = TestBed.createComponent(RefuseCdcModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
