import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { AccountPreferencesService } from './account-preferences.service';

describe('AccountPreferencesService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EnvironmentModule],
      providers: [
        {
          provide: env,
          useValue: { api_url: 'https://' }
        }
      ]
    })
  );

  it('should be created', () => {
    const service: AccountPreferencesService = TestBed.get(AccountPreferencesService);
    expect(service).toBeTruthy();
  });
});
