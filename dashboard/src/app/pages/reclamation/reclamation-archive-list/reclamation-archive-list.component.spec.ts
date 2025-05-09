import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReclamationArchiveListComponent } from './reclamation-archive-list.component';

describe('ReclamationArchiveListComponent', () => {
  let component: ReclamationArchiveListComponent;
  let fixture: ComponentFixture<ReclamationArchiveListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReclamationArchiveListComponent]
    });
    fixture = TestBed.createComponent(ReclamationArchiveListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
