import { async, inject, TestBed } from '@angular/core/testing';

import { LayerListComponent } from './layer-list.component';
import { LayerListModule } from '@tamu-gisc/maps/feature/layer-list';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchModule } from '@tamu-gisc/ui-kits/ngx/search';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { ResponsiveModule } from '@tamu-gisc/dev-tools/responsive';
import { CommonNgxRouterModule } from '@tamu-gisc/common/ngx/router';

describe('LayerListComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        LayerListComponent,
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

  it('should be created', inject([LayerListComponent], (component: LayerListComponent) => {
    expect(component).toBeTruthy();
  }));
});
