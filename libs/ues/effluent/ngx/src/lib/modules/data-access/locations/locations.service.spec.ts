import { HttpClientTestingModule } from '@angular/common/http/testing';

import { TestBed } from '@angular/core/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { LocationsService } from './locations.service';

describe('LocationsService', () => {
  let service: LocationsService;
  /* */
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EnvironmentModule],
      providers: [
        LocationsService,
        {
          provide: env,
          useValue: { apiUrl: {} }
        }
      ]
    });
    service = TestBed.inject(LocationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
