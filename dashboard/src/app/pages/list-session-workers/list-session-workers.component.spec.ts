import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSessionWorkersComponent } from './list-session-workers.component';

describe('ListSessionWorkersComponent', () => {
  let component: ListSessionWorkersComponent;
  let fixture: ComponentFixture<ListSessionWorkersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListSessionWorkersComponent]
    });
    fixture = TestBed.createComponent(ListSessionWorkersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
