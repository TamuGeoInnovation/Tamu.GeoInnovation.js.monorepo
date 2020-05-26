import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCountyClaimsComponent } from './admin-county-claims.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import {  EnvironmentService, env } from '@tamu-gisc/common/ngx/environment';

describe('AdminCountyClaimsComponent', () => {
  let component: AdminCountyClaimsComponent;
  let fixture: ComponentFixture<AdminCountyClaimsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule, UIFormsModule, RouterModule, HttpClientTestingModule],
      declarations: [ AdminCountyClaimsComponent ],
      providers: [ AdminCountyClaimsComponent,
        EnvironmentService,        {
          provide: env,
          useValue: { covid_api_url: 'http://' }
        } ]
    })
    .compileComponents();
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
