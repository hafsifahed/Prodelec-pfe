import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCdCComponent } from './add-cd-c.component';

describe('AddCdCComponent', () => {
  let component: AddCdCComponent;
  let fixture: ComponentFixture<AddCdCComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddCdCComponent]
    });
    fixture = TestBed.createComponent(AddCdCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
