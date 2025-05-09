import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevisUserlistArchiveComponent } from './devis-userlist-archive.component';

describe('DevisUserlistArchiveComponent', () => {
  let component: DevisUserlistArchiveComponent;
  let fixture: ComponentFixture<DevisUserlistArchiveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DevisUserlistArchiveComponent]
    });
    fixture = TestBed.createComponent(DevisUserlistArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
