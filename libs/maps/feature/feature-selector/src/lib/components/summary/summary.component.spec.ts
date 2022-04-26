import { async, inject, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { SearchModule } from '@tamu-gisc/ui-kits/ngx/search';
import { EsriMapModule } from '@tamu-gisc/maps/esri';

import { FeatureSelectorModule } from '../../maps-feature-feature-selector.module';
import { SelectionSummaryComponent } from './summary.component';

describe('SelectionSummaryComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        SelectionSummaryComponent,
        {
          provide: env,
          useValue: { SearchSources: [] }
        }
      ],
      imports: [
        FeatureSelectorModule,
        EsriMapModule,
        RouterTestingModule,
        SearchModule,
        HttpClientTestingModule,
        EnvironmentModule
      ]
    }).compileComponents();
  }));

  it('should create', inject([SelectionSummaryComponent], (component: SelectionSummaryComponent) => {
    expect(component).toBeTruthy();
  }));
});
