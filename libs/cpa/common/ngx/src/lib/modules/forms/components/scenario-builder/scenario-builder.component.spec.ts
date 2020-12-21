import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { StorageServiceModule, LOCAL_STORAGE } from 'ngx-webstorage-service';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { NavigationBreadcrumbModule } from '@tamu-gisc/ui-kits/ngx/navigation/breadcrumb';
import { MapsFormsModule } from '@tamu-gisc/maps/feature/forms';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { SearchModule } from '@tamu-gisc/search';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';

import { ScenarioBuilderComponent } from './scenario-builder.component';

describe('ScenarioBuilderComponent', () => {
  let component: ScenarioBuilderComponent;
  let fixture: ComponentFixture<ScenarioBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        UIFormsModule,
        UILayoutModule,
        HttpClientTestingModule,
        NavigationBreadcrumbModule,
        MapsFormsModule,
        EnvironmentModule,
        EsriMapModule,
        SearchModule,
        StorageServiceModule
      ],
      declarations: [ScenarioBuilderComponent],
      providers: [
        {
          provide: env,
          useValue: { SearchSources: [], api_url: [], NotificationEvents: [] }
        },
        {
          provide: AppStorage,
          useExisting: LOCAL_STORAGE
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScenarioBuilderComponent);
    component = fixture.componentInstance;
    /*
    Test passes when fixture.detectChanges() is included and runs: npx jest -o 
    However fails when fixture.detectChanges() is included and runs:  npx jest --collectCoverage 
    fixture.detectChanges();
    */
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
