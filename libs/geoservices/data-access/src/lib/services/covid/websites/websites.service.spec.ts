import { TestBed } from '@angular/core/testing';

import { WebsitesService } from './websites.service';

describe('WebsitesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WebsitesService = TestBed.get(WebsitesService);
    expect(service).toBeTruthy();
  });
});
