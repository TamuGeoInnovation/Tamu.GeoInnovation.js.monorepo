import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { SearchModule } from '@tamu-gisc/ui-kits/ngx/search';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { BusService } from '@tamu-gisc/maps/feature/trip-planner';

import { BusRouteComponent } from './bus-route.component';

describe('BusRouteComponent (shallow)', () => {
  let fixture: ComponentFixture<BusRouteComponent>;
  let component: BusRouteComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, EsriMapModule, SearchModule, EnvironmentModule],
      declarations: [BusRouteComponent],
      providers: [
        BusService,
        {
          provide: env,
          useValue: { SearchSources: [] }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusRouteComponent);

    component = fixture.componentInstance;

    component.route = {
      Color: `rgb(0,84,166)`,
      Description: 'description',
      Group: {
        IsGameDay: false,
        Name: 'group name',
        Order: 0
      },
      Icon: 'icon',
      Key: 'key',
      Name: 'name',
      ShortName: 'short name'
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
