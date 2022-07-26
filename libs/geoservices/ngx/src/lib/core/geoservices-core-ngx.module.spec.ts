import { async, TestBed } from '@angular/core/testing';
import { GeoservicesCoreNgxModule } from './geoservices-core-ngx.module';

describe('GeoservicesCoreNgxModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [GeoservicesCoreNgxModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(GeoservicesCoreNgxModule).toBeDefined();
  });
});
