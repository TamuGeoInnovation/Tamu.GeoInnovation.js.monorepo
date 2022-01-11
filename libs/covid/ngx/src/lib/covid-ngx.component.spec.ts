import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { StorageServiceModule, LOCAL_STORAGE } from 'ngx-webstorage-service';

import { GeoservicesCoreNgxModule } from '@tamu-gisc/geoservices/core/ngx';
import { UINavigationTriggersModule } from '@tamu-gisc/ui-kits/ngx/navigation/triggers';
import { UITileNavigationModule } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { CovidNgxComponent } from './covid-ngx.component';

describe('GeoservicesCovidComponent', () => {
  let component: CovidNgxComponent;
  let fixture: ComponentFixture<CovidNgxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        EnvironmentModule,
        StorageServiceModule,
        GeoservicesCoreNgxModule,
        UINavigationTriggersModule,
        UITileNavigationModule
      ],
      declarations: [CovidNgxComponent],
      providers: [
        CovidNgxComponent,
        {
          provide: AppStorage,
          useExisting: LOCAL_STORAGE
        },
        {
          provide: env,
          useValue: { covid_api_url: 'https://' }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CovidNgxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
