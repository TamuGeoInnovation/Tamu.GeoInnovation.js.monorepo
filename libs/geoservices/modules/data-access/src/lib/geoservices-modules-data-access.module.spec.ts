import { async, TestBed } from '@angular/core/testing';
import { GeoservicesModulesDataAccessModule } from './geoservices-modules-data-access.module';

describe('GeoservicesModulesDataAccessModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [GeoservicesModulesDataAccessModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(GeoservicesModulesDataAccessModule).toBeDefined();
  });
});
