import { async, inject, TestBed } from '@angular/core/testing';

import { LayerFilterComponent } from './layer-filter.component';
import { LayerListModule } from '@tamu-gisc/maps/feature/layer-list';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchModule } from '@tamu-gisc/search';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';

describe('LayerFilterComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        LayerFilterComponent,
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
        EnvironmentModule
      ]
    }).compileComponents();
  }));

  it('should be created', inject([LayerFilterComponent], (component: LayerFilterComponent) => {
    expect(component).toBeTruthy();
  }));
});
