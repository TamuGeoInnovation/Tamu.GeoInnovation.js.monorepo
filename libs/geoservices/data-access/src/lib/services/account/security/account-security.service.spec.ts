import { TestBed } from '@angular/core/testing';

import { AccountSecurityService } from './account-security.service';

describe('AccountSecurityService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AccountSecurityService = TestBed.get(AccountSecurityService);
    expect(service).toBeTruthy();
  });
});
