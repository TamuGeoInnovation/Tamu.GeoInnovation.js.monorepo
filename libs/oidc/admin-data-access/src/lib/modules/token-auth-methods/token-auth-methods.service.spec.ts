import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { TokenAuthMethodsService } from './token-auth-methods.service';

describe('TokenAuthMethodsService', () => {
  let service: TokenAuthMethodsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EnvironmentModule],
      providers: [
        TokenAuthMethodsService,
        {
          provide: env,
          useValue: { api_url: 'https://' }
        }
      ]
    });
    service = TestBed.get(TokenAuthMethodsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
