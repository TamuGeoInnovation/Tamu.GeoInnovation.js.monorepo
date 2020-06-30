import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { LOCAL_STORAGE, StorageServiceModule } from 'angular-webstorage-service';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { env, EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';
import { CovidFormsModule } from '@tamu-gisc/geoservices/covid';

import { CountyComponent } from './county.component';

describe('CountyComponent', () => {
  let component: CountyComponent;
  let fixture: ComponentFixture<CountyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        UIFormsModule,
        RouterTestingModule,
        StorageServiceModule,
        CovidFormsModule
      ],
      declarations: [CountyComponent],
      providers: [
        {
          provide: AppStorage,
          useExisting: LOCAL_STORAGE
        },
        EnvironmentService,
        {
          provide: env,
          useValue: { covid_api_url: 'http://' }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
