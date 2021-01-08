import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { DetailGrantTypeComponent } from './detail-grant-type.component';

describe('DetailGrantTypeComponent', () => {
  let component: DetailGrantTypeComponent;
  let fixture: ComponentFixture<DetailGrantTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        UIFormsModule,
        RouterTestingModule,
        EnvironmentModule,
        UILayoutModule,
        HttpClientTestingModule,
        FormsModule
      ],
      declarations: [DetailGrantTypeComponent],
      providers: [
        {
          provide: env,
          useValue: { api_url: 'https://' }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailGrantTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
