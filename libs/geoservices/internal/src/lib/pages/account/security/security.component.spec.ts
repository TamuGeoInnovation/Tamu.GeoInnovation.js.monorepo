import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityComponent } from './security.component';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SecurityComponent', () => {
  let component: SecurityComponent;
  let fixture: ComponentFixture<SecurityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, UIFormsModule, EnvironmentModule, HttpClientTestingModule],
      providers: [
        {
          provide: env, 
          useValue: { api_url : 'https://' }
        }],
      declarations: [ SecurityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
