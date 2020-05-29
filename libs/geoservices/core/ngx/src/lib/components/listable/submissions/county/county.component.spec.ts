import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { CountyListComponent } from './county.component';

describe('CountyComponent', () => {
  let component: CountyListComponent;
  let fixture: ComponentFixture<CountyListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [EnvironmentModule, HttpClientTestingModule],
      declarations: [CountyListComponent],
      providers: [
        CountyListComponent,
        {
          provide: env,
          useValue: { covid_api_url: 'https://' }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
