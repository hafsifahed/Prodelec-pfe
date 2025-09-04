import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkEmailComponent } from './bulk-email.component';

describe('BulkEmailComponent', () => {
  let component: BulkEmailComponent;
  let fixture: ComponentFixture<BulkEmailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BulkEmailComponent]
    });
    fixture = TestBed.createComponent(BulkEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
