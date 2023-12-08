import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorrectionDataTableComponent } from './correction-data-table.component';

describe('CorrectionDataTableComponent', () => {
  let component: CorrectionDataTableComponent;
  let fixture: ComponentFixture<CorrectionDataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CorrectionDataTableComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CorrectionDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
