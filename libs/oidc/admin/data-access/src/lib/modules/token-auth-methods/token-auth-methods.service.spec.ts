import { TestBed } from '@angular/core/testing';

import { TokenAuthMethodsService } from './token-auth-methods.service';

describe('TokenAuthMethodsService', () => {
  let service: TokenAuthMethodsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenAuthMethodsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
