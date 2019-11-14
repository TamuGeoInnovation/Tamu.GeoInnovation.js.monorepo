import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { TripPlannerBikingOptionsComponent } from './trip-planner-biking-options.component';
import { Angulartics2Module } from 'angulartics2';
import { RouterTestingModule } from '@angular/router/testing';
import { TripPlannerService } from '../../../../../services/trip-planner/trip-planner.service';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { SearchService } from '@tamu-gisc/search';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { TripPlannerConnectionService } from '../../../../../services/trip-planner/trip-planner-connection.service';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';
import { LOCAL_STORAGE, StorageServiceModule } from 'angular-webstorage-service';
import { BusService } from '../../../../../services/transportation/bus/bus.service';
import { BikeService } from '../../../../../services/transportation/bike/bike.service';
import { InrixService } from '../../../../../services/transportation/drive/inrix.service';

describe('TripPlannerBikingOptionsComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        TripPlannerBikingOptionsComponent,
        TripPlannerService,
        TripPlannerConnectionService,
        SearchService,
        BusService,
        BikeService,
        InrixService,
        {
          provide: env,
          useValue: { SearchSources: [], NotificationEvents: [] }
        },
        {
          provide: AppStorage,
          useExisting: LOCAL_STORAGE
        }
      ],
      imports: [
        Angulartics2Module.forRoot(),
        RouterTestingModule,
        EsriMapModule,
        HttpClientTestingModule,
        EnvironmentModule,
        StorageServiceModule
      ]
    }).compileComponents();
  }));

  it('should create', inject([TripPlannerBikingOptionsComponent], (component: TripPlannerBikingOptionsComponent) => {
    expect(component).toBeTruthy();
  }));
});
