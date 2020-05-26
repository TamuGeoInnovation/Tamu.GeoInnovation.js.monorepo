import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLockdownsComponent } from './admin-lockdowns.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import {  EnvironmentService, env } from '@tamu-gisc/common/ngx/environment';

describe('AdminLockdownsComponent', () => {
  let component: AdminLockdownsComponent;
  let fixture: ComponentFixture<AdminLockdownsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule, UIFormsModule, RouterModule, HttpClientTestingModule],
      declarations: [ AdminLockdownsComponent ],
      providers: [ AdminLockdownsComponent,
        EnvironmentService,        {
          provide: env,
          useValue: { covid_api_url: 'http://' }
        } ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminLockdownsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
