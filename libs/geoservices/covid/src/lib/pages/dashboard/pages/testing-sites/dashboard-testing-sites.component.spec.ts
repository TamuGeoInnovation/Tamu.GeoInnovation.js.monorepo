import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { LOCAL_STORAGE, StorageServiceModule } from 'ngx-webstorage-service';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';

import { DashboardTestingSitesComponent } from './dashboard-testing-sites.component';

describe('DashboardTestingSitesComponent', () => {
  let component: DashboardTestingSitesComponent;
  let fixture: ComponentFixture<DashboardTestingSitesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EnvironmentModule, StorageServiceModule],
      providers: [
        {
          provide: AppStorage,
          useExisting: LOCAL_STORAGE
        },
        {
          provide: env,
          useValue: { covid_api_url: 'https://' }
        }
      ],
      declarations: [DashboardTestingSitesComponent]
    }).compileComponents();
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
