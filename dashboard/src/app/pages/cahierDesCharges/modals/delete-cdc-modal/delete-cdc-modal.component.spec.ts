import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteCdcModalComponent } from './delete-cdc-modal.component';

describe('DeleteCdcModalComponent', () => {
  let component: DeleteCdcModalComponent;
  let fixture: ComponentFixture<DeleteCdcModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeleteCdcModalComponent]
    });
    fixture = TestBed.createComponent(DeleteCdcModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
