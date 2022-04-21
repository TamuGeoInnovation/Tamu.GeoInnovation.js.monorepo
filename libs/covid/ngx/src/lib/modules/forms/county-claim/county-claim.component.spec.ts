import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { CountyClaimComponent } from './county-claim.component';

describe('CountyClaimComponent', () => {
  let component: CountyClaimComponent;
  let fixture: ComponentFixture<CountyClaimComponent>;
  const formB = new FormBuilder();
  const form = new FormGroup({
    phoneNumbers: formB.array([]),
    websites: formB.array([])
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, UIFormsModule, EnvironmentModule, HttpClientTestingModule],
      declarations: [CountyClaimComponent],
      providers: [
        {
          provide: env,
          useValue: { covid_api_url: 'https://' }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountyClaimComponent);
    component = fixture.componentInstance;
    component.form = form;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
