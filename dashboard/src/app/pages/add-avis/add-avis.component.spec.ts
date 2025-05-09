import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAvisComponent } from './add-avis.component';

describe('AddAvisComponent', () => {
  let component: AddAvisComponent;
  let fixture: ComponentFixture<AddAvisComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddAvisComponent]
    });
    fixture = TestBed.createComponent(AddAvisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
