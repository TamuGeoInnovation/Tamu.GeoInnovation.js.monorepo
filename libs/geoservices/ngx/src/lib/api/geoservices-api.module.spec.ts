import { async, TestBed } from '@angular/core/testing';
import { GeoservicesApiModule } from './geoservices-api.module';

describe('geoservices-api.module', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [GeoservicesApiModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(GeoservicesApiModule).toBeDefined();
  });
});
