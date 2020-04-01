import { TestBed } from '@angular/core/testing';

import { TestingSitesService } from './testing-sites.service';

describe('TestingSitesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TestingSitesService = TestBed.get(TestingSitesService);
    expect(service).toBeTruthy();
  });
});
