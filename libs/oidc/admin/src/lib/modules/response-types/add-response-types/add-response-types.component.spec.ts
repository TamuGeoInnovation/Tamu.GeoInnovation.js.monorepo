import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { AddResponseTypesComponent } from './add-response-types.component';

describe('AddResponseTypesComponent', () => {
  let component: AddResponseTypesComponent;
  let fixture: ComponentFixture<AddResponseTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, UIFormsModule, EnvironmentModule, HttpClientTestingModule],
      declarations: [AddResponseTypesComponent],
      providers: [
        {
          provide: env,
          useValue: { api_url: [] }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddResponseTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
