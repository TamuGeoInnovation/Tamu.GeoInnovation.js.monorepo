import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { EditResponseTypesComponent } from './edit-response-types.component';

describe('EditResponseTypesComponent', () => {
  let component: EditResponseTypesComponent;
  let fixture: ComponentFixture<EditResponseTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, EnvironmentModule, HttpClientTestingModule],
      declarations: [EditResponseTypesComponent],
      providers: [
        {
          provide: env,
          useValue: { api_url: 'https://' }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditResponseTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
