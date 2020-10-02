import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { CountyClaimInfosListComponent } from './county-claim-infos-list.component';
import { CovidEntityDetailsModule } from '../../../entity-details/entity-details.module';

describe('CountyClaimInfosListComponent', () => {
  let component: CountyClaimInfosListComponent;
  let fixture: ComponentFixture<CountyClaimInfosListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UILayoutModule, CovidEntityDetailsModule, RouterTestingModule, EnvironmentModule, HttpClientTestingModule],
      declarations: [CountyClaimInfosListComponent],
      providers: [
        {
          provide: env,
          useValue: { covid_api_url: 'https://' }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountyClaimInfosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
