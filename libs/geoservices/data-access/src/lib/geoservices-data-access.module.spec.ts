import { async, TestBed } from '@angular/core/testing';
import { GeoservicesDataAccessModule } from './geoservices-data-access.module';

describe('GeoservicesDataAccessModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [GeoservicesDataAccessModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(GeoservicesDataAccessModule).toBeDefined();
  });
});
