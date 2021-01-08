import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ChartsModule } from '@tamu-gisc/charts';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { StatusService } from '@tamu-gisc/two/data-access';

import { SiteComponent } from './site.component';

describe('SiteComponent', () => {
  let component: SiteComponent;
  let fixture: ComponentFixture<SiteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ChartsModule, RouterTestingModule, EnvironmentModule, HttpClientTestingModule, ChartsModule],
      declarations: [SiteComponent],
      providers: [StatusService, { provide: env, useValue: { two_dashboard_api_url: [] } }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
