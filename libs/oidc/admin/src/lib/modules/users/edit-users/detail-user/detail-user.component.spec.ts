import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { DetailUserComponent } from './detail-user.component';

describe('DetailUserComponent', () => {
  let component: DetailUserComponent;
  let fixture: ComponentFixture<DetailUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, UIFormsModule, RouterTestingModule, EnvironmentModule, HttpClientTestingModule],
      declarations: [DetailUserComponent],
      providers: [{ provide: env, useValue: { api_url: [] } }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
