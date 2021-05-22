import { TestBed } from '@angular/core/testing';

import { SignageService } from './signage.service';

describe('SignageService', () => {
  let service: SignageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
