import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { MapsMapboxModule } from '@tamu-gisc/maps/mapbox';
import { GeoservicesCoreNgxModule } from '@tamu-gisc/geoservices/ngx';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { LandingComponent } from './landing.component';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UILayoutModule,
        RouterTestingModule,
        MapsMapboxModule,
        GeoservicesCoreNgxModule,
        EnvironmentModule,
        HttpClientTestingModule
      ],
      declarations: [LandingComponent],
      providers: [
        {
          provide: env,
          useValue: { covid_api_url: 'https://' }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
