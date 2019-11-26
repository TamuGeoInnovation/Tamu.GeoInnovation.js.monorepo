import { TestBed } from '@angular/core/testing';

import { BaseApiService } from './base-api.service';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { HttpClientModule } from '@angular/common/http';

describe('BaseApiService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [EnvironmentModule, HttpClientModule],
      providers: [
        {
          provide: env,
          useValue: {
            api_url: ''
          }
        }
      ]
    })
  );

  it('should be created', () => {
    const service: BaseApiService = TestBed.get(BaseApiService);
    expect(service).toBeTruthy();
  });
});
