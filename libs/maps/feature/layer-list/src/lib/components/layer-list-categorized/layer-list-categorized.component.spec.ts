import { async, inject, TestBed } from '@angular/core/testing';

import { LayerListCategorizedComponent } from './layer-list-categorized.component';
import { LayerListModule } from '@tamu-gisc/maps/feature/layer-list';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchModule } from '@tamu-gisc/ui-kits/ngx/search';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { ResponsiveModule } from '@tamu-gisc/dev-tools/responsive';
import { CommonNgxRouterModule, RouterHistoryService } from '@tamu-gisc/common/ngx/router';

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
