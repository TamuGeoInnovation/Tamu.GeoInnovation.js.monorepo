import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { SamplingLocationsService } from './sampling-locations.service';

describe('SamplingLocationsService', () => {
  let service: SamplingLocationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EnvironmentModule, HttpClientTestingModule],
      providers: [
        SamplingLocationsService,
        {
          provide: env,
          useValue: { apiUrl: 'effluentTiers', effluentSampleLocationsUrl: 'effluentTiers' }
        }
      ]
    });
    service = TestBed.get(SamplingLocationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
