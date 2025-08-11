import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadFileModalComponent } from './upload-file-modal.component';

describe('UploadFileModalComponent', () => {
  let component: UploadFileModalComponent;
  let fixture: ComponentFixture<UploadFileModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UploadFileModalComponent]
    });
    fixture = TestBed.createComponent(UploadFileModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
