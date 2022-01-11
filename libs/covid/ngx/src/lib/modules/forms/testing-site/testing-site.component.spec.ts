import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { StorageServiceModule, LOCAL_STORAGE } from 'ngx-webstorage-service';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';

import { TestingSiteComponent } from './testing-site.component';

describe('TestingSiteComponent', () => {
  let component: TestingSiteComponent;
  let fixture: ComponentFixture<TestingSiteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        UIFormsModule,
        RouterModule,
        EnvironmentModule,
        HttpClientTestingModule,
        StorageServiceModule
      ],
      declarations: [TestingSiteComponent],
      providers: [
        TestingSiteComponent,
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
    fixture = TestBed.createComponent(TestingSiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
