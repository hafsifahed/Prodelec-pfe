import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CDCListArchiveComponent } from './cdc-list-archive.component';

describe('CDCListArchiveComponent', () => {
  let component: CDCListArchiveComponent;
  let fixture: ComponentFixture<CDCListArchiveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CDCListArchiveComponent]
    });
    fixture = TestBed.createComponent(CDCListArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
