import { TestBed } from '@angular/core/testing';

import { CountiesService } from './counties.service';

describe('CountiesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CountiesService = TestBed.get(CountiesService);
    expect(service).toBeTruthy();
  });
});
