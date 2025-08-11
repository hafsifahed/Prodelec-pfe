import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncompleteCdcModalComponent } from './incomplete-cdc-modal.component';

describe('IncompleteCdcModalComponent', () => {
  let component: IncompleteCdcModalComponent;
  let fixture: ComponentFixture<IncompleteCdcModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IncompleteCdcModalComponent]
    });
    fixture = TestBed.createComponent(IncompleteCdcModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
