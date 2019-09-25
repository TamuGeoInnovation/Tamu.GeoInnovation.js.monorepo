import { async, TestBed } from '@angular/core/testing';
import { LegendModule } from './maps-feature-legend.module';

describe('LegendModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LegendModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(LegendModule).toBeDefined();
  });
});
