import { TestBed } from '@angular/core/testing';

import { GeoservicesAdminModule } from './geoservices-admin.module';

describe('GeoservicesAdminModule', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeoservicesAdminModule]
    }).compileComponents();
  });

  it('should create', () => {
    expect(GeoservicesAdminModule).toBeDefined();
  });
});
