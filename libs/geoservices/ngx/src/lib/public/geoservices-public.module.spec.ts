import { async, TestBed } from '@angular/core/testing';
import { GeoservicesPublicModule } from './geoservices-public.module';

describe('geoservices-public.module.ts', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [GeoservicesPublicModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(GeoservicesPublicModule).toBeDefined();
  });
});
