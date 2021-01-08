import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { ViewTokenAuthMethodsComponent } from './view-token-auth-methods.component';

describe('ViewTokenAuthMethodsComponent', () => {
  let component: ViewTokenAuthMethodsComponent;
  let fixture: ComponentFixture<ViewTokenAuthMethodsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [EnvironmentModule, HttpClientTestingModule],
      declarations: [ViewTokenAuthMethodsComponent],
      providers: [
        {
          provide: env,
          useValue: { api_url: 'https://' }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTokenAuthMethodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
