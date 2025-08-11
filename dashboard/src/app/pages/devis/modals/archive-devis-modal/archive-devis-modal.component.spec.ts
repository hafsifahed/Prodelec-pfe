import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveDevisModalComponent } from './archive-devis-modal.component';

describe('ArchiveDevisModalComponent', () => {
  let component: ArchiveDevisModalComponent;
  let fixture: ComponentFixture<ArchiveDevisModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ArchiveDevisModalComponent]
    });
    fixture = TestBed.createComponent(ArchiveDevisModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
