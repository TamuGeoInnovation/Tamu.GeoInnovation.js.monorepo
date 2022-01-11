import { async, inject, TestBed } from '@angular/core/testing';

import { LegendComponent } from './legend.component';
import { LegendModule } from '@tamu-gisc/maps/feature/legend';
import { LayerListModule } from '@tamu-gisc/maps/feature/layer-list';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchModule } from '@tamu-gisc/ui-kits/ngx/search';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { Angulartics2Module } from 'angulartics2';
import { ResponsiveModule } from '@tamu-gisc/dev-tools/responsive';
import { CommonNgxRouterModule } from '@tamu-gisc/common/ngx/router';

describe('LegendComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        LegendComponent,
        {
          provide: env,
          useValue: { SearchSources: [], LayerSources: [], LegendSources: [] }
        }
      ],
      imports: [
        LegendModule,
        LayerListModule,
        EsriMapModule,
        RouterTestingModule,
        SearchModule,
        HttpClientTestingModule,
        EnvironmentModule,
        Angulartics2Module.forRoot(),
        ResponsiveModule,
        CommonNgxRouterModule
      ]
    }).compileComponents();
  }));

  it('should be created', inject([LegendComponent], (component: LegendComponent) => {
    expect(component).toBeTruthy();
  }));
});
