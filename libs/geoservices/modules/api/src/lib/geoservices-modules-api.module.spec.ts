import { async, TestBed } from '@angular/core/testing';
import { GeoservicesModulesApiModule } from './geoservices-modules-api.module';

describe('GeoservicesModulesApiModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [GeoservicesModulesApiModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(GeoservicesModulesApiModule).toBeDefined();
  });
});
