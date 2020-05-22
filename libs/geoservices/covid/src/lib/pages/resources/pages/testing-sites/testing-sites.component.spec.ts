import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestingSitesComponent } from './testing-sites.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { env, EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { RouterTestingModule } from '@angular/router/testing';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';
import { LOCAL_STORAGE, StorageServiceModule } from 'angular-webstorage-service';

describe('TestingSitesComponent', () => {
  let component: TestingSitesComponent;
  let fixture: ComponentFixture<TestingSitesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, ReactiveFormsModule, UIFormsModule, RouterTestingModule, StorageServiceModule],
      declarations: [ TestingSitesComponent ],
      providers: [
        TestingSitesComponent,{
          provide: AppStorage, 
          useExisting: LOCAL_STORAGE 
        },
        EnvironmentService,
        {
          provide: env,
          useValue: { covid_api_url: 'http://' }
        }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestingSitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
