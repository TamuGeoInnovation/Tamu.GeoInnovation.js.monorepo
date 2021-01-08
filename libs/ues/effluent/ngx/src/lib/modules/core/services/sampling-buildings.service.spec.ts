import { TestBed } from '@angular/core/testing';
//import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { SamplingBuildingsService } from './sampling-buildings.service';

describe('SamplingBuildingsService', () => {
  let service: SamplingBuildingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EnvironmentModule],
      providers: [
        SamplingBuildingsService,
        {
          provide: env,
          useValue: { effluentTiers: 'effluentTiers' }
        }
      ]
    });
    service = TestBed.get(SamplingBuildingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
