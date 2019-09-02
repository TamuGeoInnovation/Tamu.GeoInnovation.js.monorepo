import { async, TestBed } from '@angular/core/testing';
import { MapsEsriModule } from './maps-esri.module';

describe('MapsEsriModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MapsEsriModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(MapsEsriModule).toBeDefined();
  });
});
