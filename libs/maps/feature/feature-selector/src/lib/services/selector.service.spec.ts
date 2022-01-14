import { async, inject, TestBed } from '@angular/core/testing';

import { FeatureSelectorService } from './selector.service';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchModule } from '@tamu-gisc/ui-kits/ngx/search';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';

describe('FeatureSelectorService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        FeatureSelectorService,
        {
          provide: env,
          useValue: { SearchSources: [] }
        }
      ],
      imports: [EsriMapModule, RouterTestingModule, SearchModule, HttpClientTestingModule, EnvironmentModule]
    }).compileComponents();
  }));

  it('should be created', inject([FeatureSelectorService], (service: FeatureSelectorService) => {
    expect(service).toBeTruthy();
  }));
});
