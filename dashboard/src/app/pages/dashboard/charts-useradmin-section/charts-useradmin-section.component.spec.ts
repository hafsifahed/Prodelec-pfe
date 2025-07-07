import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartsUseradminSectionComponent } from './charts-useradmin-section.component';

describe('ChartsUseradminSectionComponent', () => {
  let component: ChartsUseradminSectionComponent;
  let fixture: ComponentFixture<ChartsUseradminSectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChartsUseradminSectionComponent]
    });
    fixture = TestBed.createComponent(ChartsUseradminSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
