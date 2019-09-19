import { async, TestBed } from '@angular/core/testing';
import { MapsFeatureLayerListModule } from './maps-feature-layer-list.module';

describe('MapsFeatureLayerListModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MapsFeatureLayerListModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(MapsFeatureLayerListModule).toBeDefined();
  });
});
