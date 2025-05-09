import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSessionUsersComponent } from './list-session-users.component';

describe('ListSessionUsersComponent', () => {
  let component: ListSessionUsersComponent;
  let fixture: ComponentFixture<ListSessionUsersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListSessionUsersComponent]
    });
    fixture = TestBed.createComponent(ListSessionUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
