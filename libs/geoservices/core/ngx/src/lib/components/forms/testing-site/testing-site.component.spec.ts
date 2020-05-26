import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestingSiteComponent } from './testing-site.component';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { HttpClientModule } from '@angular/common/http';
import { StorageServiceModule, LOCAL_STORAGE } from 'angular-webstorage-service';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';

describe('TestingSiteComponent', () => {
  let component: TestingSiteComponent;
  let fixture: ComponentFixture<TestingSiteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule, UIFormsModule, RouterModule, EnvironmentModule, HttpClientModule, StorageServiceModule],
      declarations: [ TestingSiteComponent ],
      providers: [
        TestingSiteComponent,

          {
            provide: env,
            useValue: { covid_api_url : 'https://' }
          },
          {
            provide: AppStorage, 
            useExisting: LOCAL_STORAGE 
          }
      ]
    })
    .compileComponents();
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
