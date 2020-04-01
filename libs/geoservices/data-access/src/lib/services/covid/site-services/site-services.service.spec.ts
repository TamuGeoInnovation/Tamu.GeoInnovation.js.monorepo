import { TestBed } from '@angular/core/testing';

import { SiteServicesService } from './site-services.service';

describe('SiteServicesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SiteServicesService = TestBed.get(SiteServicesService);
    expect(service).toBeTruthy();
  });
});
