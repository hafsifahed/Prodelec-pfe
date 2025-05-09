import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListProjetUserAdminComponent } from './list-projet-user-admin.component';

describe('ListProjetUserAdminComponent', () => {
  let component: ListProjetUserAdminComponent;
  let fixture: ComponentFixture<ListProjetUserAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListProjetUserAdminComponent]
    });
    fixture = TestBed.createComponent(ListProjetUserAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
