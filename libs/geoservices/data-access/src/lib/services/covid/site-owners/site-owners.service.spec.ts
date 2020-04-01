import { TestBed } from '@angular/core/testing';

import { SiteOwnersService } from './site-owners.service';

describe('SiteOwnersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SiteOwnersService = TestBed.get(SiteOwnersService);
    expect(service).toBeTruthy();
  });
});
