import { async, TestBed } from '@angular/core/testing';
import { MapsFeatureCoordinatesModule } from './maps-feature-coordinates.module';

describe('MapsFeatureCoordinatesModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MapsFeatureCoordinatesModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(MapsFeatureCoordinatesModule).toBeDefined();
  });
});
