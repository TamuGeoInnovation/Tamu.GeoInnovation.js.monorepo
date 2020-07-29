import { async, TestBed } from '@angular/core/testing';
import { MapsFeatureFeatureHighlightModule } from './maps-feature-feature-highlight.module';

describe('MapsFeatureFeatureHighlightModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MapsFeatureFeatureHighlightModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(MapsFeatureFeatureHighlightModule).toBeDefined();
  });
});
