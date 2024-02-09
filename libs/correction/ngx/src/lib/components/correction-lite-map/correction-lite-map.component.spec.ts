import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorrectionLiteMapComponent } from './correction-lite-map.component';

describe('CorrectionLiteMapComponent', () => {
  let component: CorrectionLiteMapComponent;
  let fixture: ComponentFixture<CorrectionLiteMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CorrectionLiteMapComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CorrectionLiteMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
