import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { SearchModule } from '@tamu-gisc/search';

import { MapComponent } from './map.component';

describe('MapComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [EnvironmentModule, EsriMapModule, RouterTestingModule, SearchModule, HttpClientTestingModule],
      providers: [
        MapComponent,
        {
          provide: env,
          useValue: { LayerSources: [], SearchSources: [] }
        }
      ]
    }).compileComponents();
  }));

  it('should create', inject([MapComponent], (component: MapComponent) => {
    expect(component).toBeTruthy();
  }));
});
