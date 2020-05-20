import { TestBed } from '@angular/core/testing';

import { AccountSecurityService } from './account-security.service';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

describe('AccountSecurityService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule, EnvironmentModule],
    providers: [
      {
        provide: env, 
        useValue: { api_url : 'https://' }
      }
    ]
  }));

  it('should be created', () => {
    const service: AccountSecurityService = TestBed.get(AccountSecurityService);
    expect(service).toBeTruthy();
  });
});
