import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { EnvironmentService, env } from '@tamu-gisc/common/ngx/environment';

import { AdminTestingSitesComponent } from './admin-testing-sites.component';

describe('AdminTestingSitesComponent', () => {
  let component: AdminTestingSitesComponent;
  let fixture: ComponentFixture<AdminTestingSitesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, UIFormsModule, HttpClientTestingModule, RouterTestingModule],
      declarations: [AdminTestingSitesComponent],
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
    fixture = TestBed.createComponent(AdminTestingSitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
