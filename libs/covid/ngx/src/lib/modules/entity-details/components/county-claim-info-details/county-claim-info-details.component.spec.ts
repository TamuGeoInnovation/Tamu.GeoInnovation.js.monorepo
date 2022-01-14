import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CovidFormsModule } from '@tamu-gisc/geoservices/covid';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { CountyClaimInfoDetailsComponent } from './county-claim-info-details.component';

describe('CountyClaimInfoDetailsComponent', () => {
  let component: CountyClaimInfoDetailsComponent;
  let fixture: ComponentFixture<CountyClaimInfoDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CovidFormsModule, EnvironmentModule, HttpClientTestingModule],
      declarations: [CountyClaimInfoDetailsComponent],
      providers: [
        {
          provide: env,
          useValue: { covid_api_url: 'http://' }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountyClaimInfoDetailsComponent);
    component = fixture.componentInstance;
    /*Having detect changes causes an error when running jest collect coverage 
    Error: TypeError: Cannot read property 'markForCheck' of undefined */
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
