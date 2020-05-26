import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTestingSitesComponent } from './admin-testing-sites.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {  EnvironmentService, env } from '@tamu-gisc/common/ngx/environment';

describe('AdminTestingSitesComponent', () => {
  let component: AdminTestingSitesComponent;
  let fixture: ComponentFixture<AdminTestingSitesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule, UIFormsModule, RouterModule, HttpClientTestingModule],
      declarations: [ AdminTestingSitesComponent ],
      providers: [ AdminTestingSitesComponent,
        EnvironmentService,        {
          provide: env,
          useValue: { covid_api_url: 'http://' }
        } ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminTestingSitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
