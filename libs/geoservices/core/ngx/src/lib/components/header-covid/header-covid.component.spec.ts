import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { StorageServiceModule, LOCAL_STORAGE } from 'ngx-webstorage-service';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';

import { HeaderCovidComponent } from './header-covid.component';

describe('HeaderCovidComponent', () => {
  let component: HeaderCovidComponent;
  let fixture: ComponentFixture<HeaderCovidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, StorageServiceModule, EnvironmentModule, HttpClientTestingModule],
      declarations: [HeaderCovidComponent],
      providers: [
        {
          provide: env,
          useValue: { covid_api_url: 'https://' }
        },
        {
          provide: AppStorage,
          useExisting: LOCAL_STORAGE
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderCovidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
