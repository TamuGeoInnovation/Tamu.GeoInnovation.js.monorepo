import { async, inject, TestBed } from '@angular/core/testing';

import { EsriMapComponent } from './esri-map.component';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchModule } from '@tamu-gisc/search';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';

describe('EsriMapComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        EsriMapComponent,
        {
          provide: env,
          useValue: { SearchSources: [] }
        }
      ],
      imports: [EsriMapModule, RouterTestingModule, SearchModule, HttpClientTestingModule, EnvironmentModule]
    }).compileComponents();
  }));

  it('should create', inject([EsriMapComponent], (esriMapComponent: EsriMapComponent) => {
    expect(esriMapComponent).toBeTruthy();
  }));
});
