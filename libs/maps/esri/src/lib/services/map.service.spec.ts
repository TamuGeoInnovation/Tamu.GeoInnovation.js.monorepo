import { async, inject, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { SearchModule } from '@tamu-gisc/ui-kits/ngx/search';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';

import { EsriMapService } from './map.service';

describe('EsriMapService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        EsriMapService,
        {
          provide: env,
          useValue: { SearchSources: [] }
        }
      ],
      imports: [EsriMapModule, RouterTestingModule, SearchModule, EnvironmentModule, HttpClientTestingModule]
    }).compileComponents();
  }));

  it('should be created', inject([EsriMapService], (esriMapService: EsriMapService) => {
    expect(esriMapService).toBeTruthy();
  }));
});
