import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListProjectUserComponent } from './list-project-user.component';

describe('ListProjectUserComponent', () => {
  let component: ListProjectUserComponent;
  let fixture: ComponentFixture<ListProjectUserComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListProjectUserComponent]
    });
    fixture = TestBed.createComponent(ListProjectUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
