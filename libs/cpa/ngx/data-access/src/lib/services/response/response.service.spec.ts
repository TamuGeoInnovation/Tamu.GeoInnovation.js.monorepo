import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { ResponseService } from './response.service';

describe('ResponseService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [EnvironmentModule, HttpClientTestingModule],
      providers: [
        {
          provide: env,
          useValue: { api_url: 'https://' }
        }
      ]
    })
  );

  it('should be created', () => {
    const service: ResponseService = TestBed.get(ResponseService);
    expect(service).toBeTruthy();
  });
});
