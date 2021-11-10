import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SettingsModule } from '@tamu-gisc/common/ngx/settings';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { AuthModule } from '../../../auth/auth.module';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, AuthModule, EnvironmentModule, SettingsModule],
      declarations: [LoginComponent],
      providers: [
        {
          provide: env,
          useValue: { LocalStoreSettings: {} }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
