import { TestBed } from '@angular/core/testing';

import { WebsiteTypesService } from './website-types.service';

describe('WebsiteTypesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WebsiteTypesService = TestBed.get(WebsiteTypesService);
    expect(service).toBeTruthy();
  });
});
