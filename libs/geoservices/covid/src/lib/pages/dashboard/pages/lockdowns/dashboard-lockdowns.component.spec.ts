import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardLockdownsComponent } from './dashboard-lockdowns.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { RouterTestingModule } from '@angular/router/testing';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';
import { LOCAL_STORAGE, StorageServiceModule } from 'angular-webstorage-service';

describe('DashboardLockdownsComponent', () => {
  let component: DashboardLockdownsComponent;
  let fixture: ComponentFixture<DashboardLockdownsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, EnvironmentModule, StorageServiceModule],
      providers: [    
        DashboardLockdownsComponent,
        {
          provide: AppStorage, 
          useExisting: LOCAL_STORAGE 
        },
        {
          provide: env, 
          useValue: { covid_api_url : 'https://' }
        }
      ],
      declarations: [ DashboardLockdownsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardLockdownsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
