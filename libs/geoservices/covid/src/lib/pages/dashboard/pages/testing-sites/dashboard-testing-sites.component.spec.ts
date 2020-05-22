import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTestingSitesComponent } from './dashboard-testing-sites.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { RouterTestingModule } from '@angular/router/testing';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';
import { LOCAL_STORAGE, StorageServiceModule } from 'angular-webstorage-service';

describe('DashboardTestingSitesComponent', () => {
  let component: DashboardTestingSitesComponent;
  let fixture: ComponentFixture<DashboardTestingSitesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, EnvironmentModule, StorageServiceModule],
      providers: [    
        DashboardTestingSitesComponent,
        {
          provide: AppStorage, 
          useExisting: LOCAL_STORAGE 
        },
        {
          provide: env, 
          useValue: { covid_api_url : 'https://' }
        }
      ],
      declarations: [ DashboardTestingSitesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardTestingSitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
