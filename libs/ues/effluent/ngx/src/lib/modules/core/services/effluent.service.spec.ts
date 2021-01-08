import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TestBed } from '@angular/core/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { EffluentService } from './effluent.service';

describe('EffluentService', () => {
  let service: EffluentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, EnvironmentModule],
      providers: [
        EffluentService,
        {
          provide: env,
          useValue: {
            effluentTiers: ' ',
            SearchSources: '',
            LayerSources: '',
            apiUrl: '',
            effluentSampleLocationsUrl: '',
            effluentZonesUrl: ''
          }
        }
      ]
    });
    service = TestBed.get(EffluentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
