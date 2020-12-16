import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { StatsService } from './stats.service';

describe('StatsService', () => {
  let service: StatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EnvironmentModule, HttpClientTestingModule],

      providers: [
        StatsService,
        {
          provide: env,
          useValue: { api_url: 'https://' }
        }
      ]
    });
    service = TestBed.get(StatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
