import { ElementRef } from '@angular/core';
import { inject, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { env } from '@tamu-gisc/common/ngx/environment';
import { SearchComponent, SearchMobileComponent, SearchResultPipe } from '@tamu-gisc/ui-kits/ngx/search';

import { EsriMapService } from '../../services/map/map.service';
import { EsriMapComponent } from './esri-map.component';

describe('EsriMapComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        EsriMapComponent,
        {
          provide: env,
          useValue: { SearchSources: [], LayerSources: [] }
        }
      ],
      imports: [
        EsriMapComponent,
        RouterTestingModule,
        SearchComponent,
        SearchMobileComponent,
        SearchResultPipe,
        HttpClientTestingModule
      ]
    }).compileComponents();
  });

  it('should create', inject([EsriMapComponent], (esriMapComponent: EsriMapComponent) => {
    expect(esriMapComponent).toBeTruthy();
  }));

  it('should error on missing config', inject([EsriMapComponent], (esriMapComponent: EsriMapComponent) => {
    expect(() => esriMapComponent.ngOnInit()).toThrow(new Error('Incorrectly formed configuration provided.'));
  }));

  it('should correctly configure map service', () => {
    // Loading the map needs ArcGIS's ES modules, which Jest cannot import. The rejection that left was
    // reported by nobody under zone.js and ends the Jest worker without it (#1478); this spec is about
    // the configuration handed over, so the load itself is not run.
    const loadMap = vi.spyOn(TestBed.inject(EsriMapService), 'loadMap').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(EsriMapComponent);
    const esriMapComponent = fixture.componentInstance;
    fixture.componentRef.setInput('config', { basemap: null, view: { properties: {}, mode: '2d' } });
    // The container is a signal query; stand in for it with a function returning the element reference.
    (esriMapComponent as unknown as { container: () => ElementRef }).container = () => ({ nativeElement: null });
    expect(esriMapComponent.ngOnInit()).toBeUndefined();
    expect(loadMap).toHaveBeenCalledWith(null, { properties: { container: null }, mode: '2d' });
  });
});
