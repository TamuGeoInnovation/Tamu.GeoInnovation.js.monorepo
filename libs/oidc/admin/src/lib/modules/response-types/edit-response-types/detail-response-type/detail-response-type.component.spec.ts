import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { DetailResponseTypeComponent } from './detail-response-type.component';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DetailResponseTypeComponent', () => {
  let component: DetailResponseTypeComponent;
  let fixture: ComponentFixture<DetailResponseTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, UIFormsModule, RouterTestingModule, EnvironmentModule, HttpClientTestingModule],
      declarations: [DetailResponseTypeComponent],
      providers: [
        {
          provide: env,
          useValue: { api_url: 'https://' }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailResponseTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
