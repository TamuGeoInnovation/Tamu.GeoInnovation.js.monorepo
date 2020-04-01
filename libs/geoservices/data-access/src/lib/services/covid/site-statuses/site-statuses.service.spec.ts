import { TestBed } from '@angular/core/testing';

import { SiteStatusesService } from './site-statuses.service';

describe('SiteStatusesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SiteStatusesService = TestBed.get(SiteStatusesService);
    expect(service).toBeTruthy();
  });
});
