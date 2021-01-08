import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { AccessTokenService } from './access-tokens.service';

describe('AccessTokenService', () => {
  let service: AccessTokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EnvironmentModule],
      providers: [
        AccessTokenService,
        {
          provide: env,
          useValue: { api_url: 'https://' }
        }
      ]
    });
    service = TestBed.get(AccessTokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
