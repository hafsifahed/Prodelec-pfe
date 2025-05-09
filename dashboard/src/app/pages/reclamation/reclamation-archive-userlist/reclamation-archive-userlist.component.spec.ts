import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReclamationArchiveUserlistComponent } from './reclamation-archive-userlist.component';

describe('ReclamationArchiveUserlistComponent', () => {
  let component: ReclamationArchiveUserlistComponent;
  let fixture: ComponentFixture<ReclamationArchiveUserlistComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReclamationArchiveUserlistComponent]
    });
    fixture = TestBed.createComponent(ReclamationArchiveUserlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
