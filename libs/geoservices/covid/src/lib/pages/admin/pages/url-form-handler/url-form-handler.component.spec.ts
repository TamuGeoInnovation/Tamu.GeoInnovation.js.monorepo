import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormBuilder } from '@angular/forms';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { UrlFormHandlerComponent } from './url-form-handler.component';

describe('UrlFormHandlerComponent', () => {
  let component: UrlFormHandlerComponent;
  let fixture: ComponentFixture<UrlFormHandlerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, EnvironmentModule, HttpClientTestingModule],
      declarations: [UrlFormHandlerComponent],
      providers: [FormBuilder, { provide: env, useValue: { covid_api_url: 'https://' } }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UrlFormHandlerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
