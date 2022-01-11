import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { EnvironmentService, env } from '@tamu-gisc/common/ngx/environment';

import { AdminLockdownsComponent } from './admin-lockdowns.component';

describe('AdminLockdownsComponent', () => {
  let component: AdminLockdownsComponent;
  let fixture: ComponentFixture<AdminLockdownsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, UIFormsModule, HttpClientTestingModule, RouterTestingModule],
      declarations: [AdminLockdownsComponent],
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
    fixture = TestBed.createComponent(AdminLockdownsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
