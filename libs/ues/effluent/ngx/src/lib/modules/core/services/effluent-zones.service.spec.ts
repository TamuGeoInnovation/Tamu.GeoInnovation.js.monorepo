import { TestBed } from '@angular/core/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { EffluentZonesService } from './effluent-zones.service';

describe('EffluentZonesService', () => {
  let service: EffluentZonesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EnvironmentModule],
      providers: [
        EffluentZonesService,
        {
          provide: env,
          useValue: { effluentZonesUrl: 'effluentTiers' }
        }
      ]
    });
    service = TestBed.get(EffluentZonesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
