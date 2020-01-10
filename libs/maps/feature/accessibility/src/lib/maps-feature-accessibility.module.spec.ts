import { async, TestBed } from '@angular/core/testing';
import { MapsFeatureAccessibilityModule } from './maps-feature-accessibility.module';

describe('MapsFeatureAccessibilityModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MapsFeatureAccessibilityModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(MapsFeatureAccessibilityModule).toBeDefined();
  });
});
