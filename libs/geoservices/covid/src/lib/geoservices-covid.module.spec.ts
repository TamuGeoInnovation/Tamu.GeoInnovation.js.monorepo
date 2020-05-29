import { async, TestBed } from '@angular/core/testing';
import { GeoservicesCovidModule } from './geoservices-covid.module';

describe('GeoservicesCovidModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [GeoservicesCovidModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(GeoservicesCovidModule).toBeDefined();
  });
});
