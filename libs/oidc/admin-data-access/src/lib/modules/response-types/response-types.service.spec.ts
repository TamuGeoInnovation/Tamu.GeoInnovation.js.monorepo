import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { ResponseTypesService } from './response-types.service';

describe('ResponseTypesService', () => {
  let service: ResponseTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EnvironmentModule],
      providers: [
        ResponseTypesService,
        {
          provide: env,
          useValue: { api_url: 'https://' }
        }
      ]
    });
    service = TestBed.get(ResponseTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
