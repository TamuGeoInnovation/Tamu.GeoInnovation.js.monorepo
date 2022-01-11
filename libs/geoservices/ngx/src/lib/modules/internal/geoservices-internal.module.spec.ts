import { async, TestBed } from '@angular/core/testing';
import { GeoservicesInternalModule } from './geoservices-internal.module';

describe('GeoservicesInternalModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [GeoservicesInternalModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(GeoservicesInternalModule).toBeDefined();
  });
});
