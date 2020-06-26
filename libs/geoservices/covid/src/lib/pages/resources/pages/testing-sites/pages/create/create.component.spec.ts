import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { StorageServiceModule, LOCAL_STORAGE } from 'angular-webstorage-service';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { GeoservicesCoreNgxModule } from '@tamu-gisc/geoservices/core/ngx';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';
import { CovidFormsModule } from '@tamu-gisc/geoservices/covid';

import { CreateComponent } from './create.component';

describe('CreateComponent', () => {
  let component: CreateComponent;
  let fixture: ComponentFixture<CreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        UIFormsModule,
        RouterTestingModule,
        StorageServiceModule,
        GeoservicesCoreNgxModule,
        EnvironmentModule,
        HttpClientTestingModule,
        CovidFormsModule
      ],
      declarations: [CreateComponent],
      providers: [
        CreateComponent,
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
    fixture = TestBed.createComponent(CreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
