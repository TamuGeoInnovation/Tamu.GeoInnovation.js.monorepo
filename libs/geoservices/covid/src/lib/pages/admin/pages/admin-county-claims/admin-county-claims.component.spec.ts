import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { EnvironmentService, env } from '@tamu-gisc/common/ngx/environment';

import { AdminCountyClaimsComponent } from './admin-county-claims.component';

describe('AdminCountyClaimsComponent', () => {
  let component: AdminCountyClaimsComponent;
  let fixture: ComponentFixture<AdminCountyClaimsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, UIFormsModule, HttpClientTestingModule, RouterTestingModule],
      declarations: [AdminCountyClaimsComponent],
      providers: [
        EnvironmentService,
        {
          provide: env,
          useValue: { covid_api_url: 'http://' }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCountyClaimsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
