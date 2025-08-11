import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveCdcModalComponentTsComponent } from './archive-cdc-modal.component';

describe('ArchiveCdcModalComponentTsComponent', () => {
  let component: ArchiveCdcModalComponentTsComponent;
  let fixture: ComponentFixture<ArchiveCdcModalComponentTsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ArchiveCdcModalComponentTsComponent]
    });
    fixture = TestBed.createComponent(ArchiveCdcModalComponentTsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
