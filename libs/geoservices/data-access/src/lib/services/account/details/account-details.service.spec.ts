import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { AccountDetailsService } from './account-details.service';

describe('AccountDetailsService', () => {
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
    const service: AccountDetailsService = TestBed.get(AccountDetailsService);
    expect(service).toBeTruthy();
  });
});
