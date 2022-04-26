import { async, inject, TestBed } from '@angular/core/testing';

import { LayerListCategorizedComponent } from './layer-list-categorized.component';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchModule } from '@tamu-gisc/ui-kits/ngx/search';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { ResponsiveModule } from '@tamu-gisc/dev-tools/responsive';
import { CommonNgxRouterModule } from '@tamu-gisc/common/ngx/router';

import { LayerListModule } from '../../maps-feature-layer-list.module';

describe('LayerListCategorizedComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        LayerListCategorizedComponent,
        {
          provide: env,
          useValue: { SearchSources: [], LayerSources: [] }
        }
      ],
      imports: [
        LayerListModule,
        EsriMapModule,
        RouterTestingModule,
        SearchModule,
        HttpClientTestingModule,
        EnvironmentModule,
        ResponsiveModule,
        CommonNgxRouterModule
      ]
    }).compileComponents();
  }));

  it('should be created', inject([LayerListCategorizedComponent], (component: LayerListCategorizedComponent) => {
    expect(component).toBeTruthy();
  }));
});
