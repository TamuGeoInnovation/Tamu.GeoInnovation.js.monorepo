import { TestBed } from '@angular/core/testing';

import { StrapiService } from './strapi.service';

describe('StrapiService', () => {
  let service: StrapiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StrapiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
