import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { DetailTokenAuthMethodComponent } from './detail-token-auth-method.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DetailTokenAuthMethodComponent', () => {
  let component: DetailTokenAuthMethodComponent;
  let fixture: ComponentFixture<DetailTokenAuthMethodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, UIFormsModule, RouterTestingModule, EnvironmentModule, HttpClientTestingModule],
      declarations: [DetailTokenAuthMethodComponent],
      providers: [
        {
          provide: env,
          useValue: { api_url: 'https://' }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailTokenAuthMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
