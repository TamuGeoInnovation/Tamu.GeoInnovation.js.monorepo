import { ElementRef } from '@angular/core';
import { inject, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { env } from '@tamu-gisc/common/ngx/environment';
import { SearchComponent, SearchMobileComponent, SearchResultPipe } from '@tamu-gisc/ui-kits/ngx/search';

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
    const fixture = TestBed.createComponent(EsriMapComponent);
    const esriMapComponent = fixture.componentInstance;
    fixture.componentRef.setInput('config', { basemap: null, view: { properties: {}, mode: '2d' } });
    // The container is a signal query; stand in for it with a function returning the element reference.
    (esriMapComponent as unknown as { container: () => ElementRef }).container = () => ({ nativeElement: null });
    expect(esriMapComponent.ngOnInit()).toBeUndefined();
  });
});
