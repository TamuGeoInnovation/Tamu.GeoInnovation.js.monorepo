import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { SearchModule } from '@tamu-gisc/search';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { BusService, MapsFeatureTripPlannerModule } from '@tamu-gisc/maps/feature/trip-planner';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { AggiemapModule } from '@tamu-gisc/aggiemap';

import { BusRouteComponent } from './bus-route.component';
import { BusTimetableComponent } from '../bus-timetable/bus-timetable.component';

describe('BusRouteComponent (integrated)', () => {
  let fixture: ComponentFixture<BusRouteComponent>;
  let component: BusRouteComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        EsriMapModule,
        RouterTestingModule,
        SearchModule,
        EnvironmentModule,
        AggiemapModule,
        MapsFeatureTripPlannerModule,
        UILayoutModule
      ],
      declarations: [BusRouteComponent, BusTimetableComponent],
      providers: [
        BusService,
        {
          provide: env,
          useValue: { SearchSources: [] }
        }
      ]
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
