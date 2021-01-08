import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { ViewGrantTypesComponent } from './view-grant-types.component';

describe('ViewGrantTypesComponent', () => {
  let component: ViewGrantTypesComponent;
  let fixture: ComponentFixture<ViewGrantTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [EnvironmentModule, HttpClientTestingModule],
      declarations: [ViewGrantTypesComponent],
      providers: [
        {
          provide: env,
          useValue: { api_url: 'https://' }
        }
      ]
    }).compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(ViewGrantTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
