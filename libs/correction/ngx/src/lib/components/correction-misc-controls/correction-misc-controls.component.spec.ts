import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorrectionMiscControlsComponent } from './correction-misc-controls.component';

describe('CorrectionMiscControlsComponent', () => {
  let component: CorrectionMiscControlsComponent;
  let fixture: ComponentFixture<CorrectionMiscControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CorrectionMiscControlsComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CorrectionMiscControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
