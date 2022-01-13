import { TestBed } from '@angular/core/testing';

import { UniversityService } from './university.service';

describe('UniversityService', () => {
  let service: UniversityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UniversityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
