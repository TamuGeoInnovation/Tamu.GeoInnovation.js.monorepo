import { ElementRef } from '@angular/core';
import { async, inject, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { SearchModule } from '@tamu-gisc/ui-kits/ngx/search';

import { EsriMapModule } from '../../maps-esri.module';
import { EsriMapComponent } from './esri-map.component';

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

  it('should error on missing config', inject([EsriMapComponent], (esriMapComponent: EsriMapComponent) => {
    expect(() => esriMapComponent.ngOnInit()).toThrow(new Error('Incorrectly formed configuration provided.'));
  }));

  it('should correctly configure map service', inject([EsriMapComponent], (esriMapComponent: EsriMapComponent) => {
    esriMapComponent.config = { basemap: null, view: { properties: {}, mode: '2d' } };
    (esriMapComponent as unknown as { container: ElementRef }).container = { nativeElement: null };
    expect(esriMapComponent.ngOnInit()).toBeUndefined();
  }));
});
