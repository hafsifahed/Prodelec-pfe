import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListAvisComponent } from './list-avis.component';

describe('ListAvisComponent', () => {
  let component: ListAvisComponent;
  let fixture: ComponentFixture<ListAvisComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListAvisComponent]
    });
    fixture = TestBed.createComponent(ListAvisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
