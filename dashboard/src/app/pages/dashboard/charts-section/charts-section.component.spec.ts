import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartsSectionComponent } from './charts-section.component';

describe('ChartsSectionComponent', () => {
  let component: ChartsSectionComponent;
  let fixture: ComponentFixture<ChartsSectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChartsSectionComponent]
    });
    fixture = TestBed.createComponent(ChartsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
