import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { AdminCountiesComponent } from './admin-counties.component';

describe('AdminCountiesComponent', () => {
  let component: AdminCountiesComponent;
  let fixture: ComponentFixture<AdminCountiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EnvironmentModule, RouterTestingModule],
      providers: [
        {
          provide: env,
          useValue: { covid_api_url: 'https://' }
        }
      ],
      declarations: [AdminCountiesComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCountiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
