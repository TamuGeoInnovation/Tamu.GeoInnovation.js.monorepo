import { async, TestBed } from '@angular/core/testing';
import { MapsFeaturePopupModule } from './maps-feature-popup.module';

describe('MapsFeaturePopupModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MapsFeaturePopupModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(MapsFeaturePopupModule).toBeDefined();
  });
});
