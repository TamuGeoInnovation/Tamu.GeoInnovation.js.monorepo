import { async, inject, TestBed } from '@angular/core/testing';

import { LayerListService } from './layer-list.service';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchModule } from '@tamu-gisc/ui-kits/ngx/search';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';

describe('LayerListService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        LayerListService,
        {
          provide: env,
          useValue: { SearchSources: [], LayerSources: [] }
        }
      ],
      imports: [EsriMapModule, RouterTestingModule, SearchModule, HttpClientTestingModule, EnvironmentModule]
    }).compileComponents();
  }));

  it('should be created', inject([LayerListService], (service: LayerListService) => {
    expect(service).toBeTruthy();
  }));
});
