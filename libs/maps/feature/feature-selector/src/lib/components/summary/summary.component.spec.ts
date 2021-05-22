import { async, inject, TestBed } from '@angular/core/testing';

import { SelectionSummaryComponent } from './summary.component';
import { FeatureSelectorModule } from '@tamu-gisc/maps/feature/feature-selector';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchModule } from '@tamu-gisc/search';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';

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
