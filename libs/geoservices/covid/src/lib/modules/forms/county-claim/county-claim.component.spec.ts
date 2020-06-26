import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { CountyClaimComponent } from './county-claim.component';

describe('CountyClaimComponent', () => {
  let component: CountyClaimComponent;
  let fixture: ComponentFixture<CountyClaimComponent>;
  const formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule, UIFormsModule, EnvironmentModule, HttpClientTestingModule],
      declarations: [CountyClaimComponent],
      providers: [
        {
          provide: env,
          useValue: { covid_api_url: 'https://' }
        },
        { provide: FormBuilder, useValue: formBuilder }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountyClaimComponent);
    component = fixture.componentInstance;
    component.form = formBuilder.group({ ['readonly']: Boolean, ['infoGuid']: String }, {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
