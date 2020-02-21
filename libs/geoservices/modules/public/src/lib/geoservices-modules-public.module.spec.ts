import { async, TestBed } from '@angular/core/testing';
import { GeoservicesModulesPublicModule } from './geoservices-modules-public.module';

describe('GeoservicesModulesPublicModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [GeoservicesModulesPublicModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(GeoservicesModulesPublicModule).toBeDefined();
  });
});
