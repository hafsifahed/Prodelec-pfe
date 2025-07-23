import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReclamationSettingsComponent } from './reclamation-settings.component';

describe('ReclamationSettingsComponent', () => {
  let component: ReclamationSettingsComponent;
  let fixture: ComponentFixture<ReclamationSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReclamationSettingsComponent]
    });
    fixture = TestBed.createComponent(ReclamationSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
