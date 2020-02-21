import { TestBed } from '@angular/core/testing';

import { AccountPreferencesService } from './account-preferences.service';

describe('AccountPreferencesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AccountPreferencesService = TestBed.get(AccountPreferencesService);
    expect(service).toBeTruthy();
  });
});
