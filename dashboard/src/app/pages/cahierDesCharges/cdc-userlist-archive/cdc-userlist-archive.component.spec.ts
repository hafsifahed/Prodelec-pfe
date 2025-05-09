import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CDCUserlistArchiveComponent } from './cdc-userlist-archive.component';

describe('CDCUserlistArchiveComponent', () => {
  let component: CDCUserlistArchiveComponent;
  let fixture: ComponentFixture<CDCUserlistArchiveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CDCUserlistArchiveComponent]
    });
    fixture = TestBed.createComponent(CDCUserlistArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
