import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { LOCAL_STORAGE, StorageServiceModule } from 'ngx-webstorage-service';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';

import { DashboardLockdownsComponent } from './dashboard-lockdowns.component';

describe('DashboardLockdownsComponent', () => {
  let component: DashboardLockdownsComponent;
  let fixture: ComponentFixture<DashboardLockdownsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EnvironmentModule, StorageServiceModule, RouterTestingModule],
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
      declarations: [DashboardLockdownsComponent]
    }).compileComponents();
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
