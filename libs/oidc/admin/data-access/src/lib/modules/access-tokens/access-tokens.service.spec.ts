import { TestBed } from '@angular/core/testing';

import { AccessTokenService } from './access-tokens.service';

describe('AccessTokenService', () => {
  let service: AccessTokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessTokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
