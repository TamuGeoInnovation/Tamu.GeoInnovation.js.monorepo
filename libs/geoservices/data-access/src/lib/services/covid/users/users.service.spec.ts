import { TestBed } from '@angular/core/testing';

import { UsersService } from './users.service';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

describe('UsersService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule, EnvironmentModule],
    providers: [
      {
        provide: env, 
        useValue: { covid_api_url : 'https://' }
      }
    ]
  }));

  it('should be created', () => {
    const service: UsersService = TestBed.get(UsersService);
    expect(service).toBeTruthy();
  });
});
