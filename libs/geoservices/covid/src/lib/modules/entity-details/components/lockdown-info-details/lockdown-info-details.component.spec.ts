import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CovidFormsModule } from '@tamu-gisc/geoservices/covid';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { LockdownInfoDetailsComponent } from './lockdown-info-details.component';

describe('LockdownInfoDetailsComponent', () => {
  let component: LockdownInfoDetailsComponent;
  let fixture: ComponentFixture<LockdownInfoDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CovidFormsModule, EnvironmentModule, HttpClientTestingModule],
      declarations: [LockdownInfoDetailsComponent],
      providers: [
        {
          provide: env,
          useValue: { covid_api_url: 'https://' }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LockdownInfoDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
