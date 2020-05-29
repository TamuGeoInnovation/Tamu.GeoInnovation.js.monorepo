import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { LOCAL_STORAGE, StorageServiceModule } from 'angular-webstorage-service';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { env, EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';

import { ProfileComponent } from './profile.component';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        UIFormsModule,
        RouterTestingModule,
        StorageServiceModule
      ],
      declarations: [ProfileComponent],
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
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
