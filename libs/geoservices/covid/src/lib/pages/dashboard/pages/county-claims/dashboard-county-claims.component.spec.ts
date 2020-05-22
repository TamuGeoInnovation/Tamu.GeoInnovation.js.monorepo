import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCountyClaimsComponent } from './dashboard-county-claims.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { RouterTestingModule } from '@angular/router/testing';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';
import { LOCAL_STORAGE, StorageServiceModule } from 'angular-webstorage-service';

describe('DashboardCountyClaimsComponent', () => {
  let component: DashboardCountyClaimsComponent;
  let fixture: ComponentFixture<DashboardCountyClaimsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({ 
      imports: [RouterTestingModule, HttpClientTestingModule, EnvironmentModule, StorageServiceModule],
      providers: [    
        DashboardCountyClaimsComponent,
        {
          provide: AppStorage, 
          useExisting: LOCAL_STORAGE 
        },
        {
          provide: env, 
          useValue: { covid_api_url : 'https://' }
        }
      ],
      declarations: [ DashboardCountyClaimsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardCountyClaimsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
