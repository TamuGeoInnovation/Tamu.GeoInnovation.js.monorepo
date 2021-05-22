import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { LockdownInfosListComponent } from './lockdown-infos-list.component';
import { CovidEntityDetailsModule } from '../../../entity-details/entity-details.module';

describe('LockdownInfosListComponent', () => {
  let component: LockdownInfosListComponent;
  let fixture: ComponentFixture<LockdownInfosListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UILayoutModule, CovidEntityDetailsModule, RouterTestingModule, EnvironmentModule, HttpClientTestingModule],
      declarations: [LockdownInfosListComponent],
      providers: [
        {
          provide: env,
          useValue: { covid_api_url: 'https://' }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LockdownInfosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
