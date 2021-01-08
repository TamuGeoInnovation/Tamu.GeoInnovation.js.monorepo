import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { AddTokenAuthMethodsComponent } from './add-token-auth-methods.component';

describe('AddTokenAuthMethodsComponent', () => {
  let component: AddTokenAuthMethodsComponent;
  let fixture: ComponentFixture<AddTokenAuthMethodsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, UIFormsModule, EnvironmentModule, HttpClientTestingModule],
      declarations: [AddTokenAuthMethodsComponent],
      providers: [
        {
          provide: env,
          useValue: { api_url: [] }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTokenAuthMethodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
