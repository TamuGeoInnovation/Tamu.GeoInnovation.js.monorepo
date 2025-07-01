import { TestBed } from '@angular/core/testing';

import { GeoservicesUserModule } from './geoservices-user.module';

describe('GeoservicesUserModule', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeoservicesUserModule]
    }).compileComponents();
  });

  it('should create', () => {
    expect(GeoservicesUserModule).toBeDefined();
  });
});
