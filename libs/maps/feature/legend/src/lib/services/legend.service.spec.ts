import { async, inject, TestBed } from '@angular/core/testing';

import { LegendService } from './legend.service';
import { LayerListModule } from '@tamu-gisc/maps/feature/layer-list';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchModule } from '@tamu-gisc/search';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';

describe('LegendService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        LegendService,
        {
          provide: env,
          useValue: { SearchSources: [], LayerSources: [], LegendSources: [] }
        }
      ],
      imports: [
        LayerListModule,
        EsriMapModule,
        RouterTestingModule,
        SearchModule,
        HttpClientTestingModule,
        EnvironmentModule
      ]
    }).compileComponents();
  }));

  it('should be created', inject([LegendService], (service: LegendService) => {
    expect(service).toBeTruthy();
  }));
});
