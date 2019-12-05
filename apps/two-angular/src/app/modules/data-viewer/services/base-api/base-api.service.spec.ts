import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { BaseApiService } from './base-api.service';

describe('BaseApiService', <T>() => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [EnvironmentModule, HttpClientModule],
      providers: [
        {
          provide: env,
          useValue: {
            api_url: 'http://'
          }
        }
      ]
    })
  );

  it('should be created', () => {
    const service: BaseApiService<T> = TestBed.get(BaseApiService);
    expect(service).toBeTruthy();
  });
});
