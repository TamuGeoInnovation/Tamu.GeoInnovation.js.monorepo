import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { GrantTypesService } from './grant-types.service';

describe('GrantTypesService', () => {
  let service: GrantTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EnvironmentModule],
      providers: [
        GrantTypesService,
        {
          provide: env,
          useValue: { api_url: 'https://' }
        }
      ]
    });
    service = TestBed.get(GrantTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
