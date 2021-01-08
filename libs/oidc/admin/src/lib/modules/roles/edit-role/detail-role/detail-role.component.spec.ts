import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { DetailRoleComponent } from './detail-role.component';

describe('DetailRoleComponent', () => {
  let component: DetailRoleComponent;
  let fixture: ComponentFixture<DetailRoleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, UIFormsModule, RouterTestingModule, EnvironmentModule, HttpClientTestingModule],
      declarations: [DetailRoleComponent],
      providers: [
        {
          provide: env,
          useValue: { api_url: [] }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
