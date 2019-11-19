import { async, inject, TestBed } from '@angular/core/testing';

import { FeatureCollectorService } from './collector.service';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchModule } from '@tamu-gisc/search';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';

describe('FeatureCollectorService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        FeatureCollectorService,
        {
          provide: env,
          useValue: { SearchSources: [] }
        }
      ],
      imports: [EsriMapModule, RouterTestingModule, SearchModule, HttpClientTestingModule, EnvironmentModule]
    }).compileComponents();
  }));

  it('should be created', inject([FeatureCollectorService], (service: FeatureCollectorService) => {
    expect(service).toBeTruthy();
  }));
});
