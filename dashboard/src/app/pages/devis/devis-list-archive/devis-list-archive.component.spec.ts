import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevisListArchiveComponent } from './devis-list-archive.component';

describe('DevisListArchiveComponent', () => {
  let component: DevisListArchiveComponent;
  let fixture: ComponentFixture<DevisListArchiveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DevisListArchiveComponent]
    });
    fixture = TestBed.createComponent(DevisListArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
