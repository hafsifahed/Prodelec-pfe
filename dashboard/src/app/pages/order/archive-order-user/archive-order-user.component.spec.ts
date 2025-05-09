import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveOrderUserComponent } from './archive-order-user.component';

describe('ArchiveOrderUserComponent', () => {
  let component: ArchiveOrderUserComponent;
  let fixture: ComponentFixture<ArchiveOrderUserComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ArchiveOrderUserComponent]
    });
    fixture = TestBed.createComponent(ArchiveOrderUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
