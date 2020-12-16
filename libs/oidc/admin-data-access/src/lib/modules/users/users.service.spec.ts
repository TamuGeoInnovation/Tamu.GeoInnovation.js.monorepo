import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EnvironmentModule],
      providers: [
        UsersService,
        {
          provide: env,
          useValue: { api_url: 'https://' }
        }
      ]
    });
    service = TestBed.get(UsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
