import { TestBed } from '@angular/core/testing';

import { AccountDetailsService } from './account-details.service';

describe('AccountDetailsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AccountDetailsService = TestBed.get(AccountDetailsService);
    expect(service).toBeTruthy();
  });
});
