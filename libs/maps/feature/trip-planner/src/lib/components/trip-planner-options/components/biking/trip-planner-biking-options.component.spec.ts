import { async, inject, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { LOCAL_STORAGE, StorageServiceModule } from 'ngx-webstorage-service';
import { Angulartics2Module } from 'angulartics2';

import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { SearchService } from '@tamu-gisc/ui-kits/ngx/search';

import { TripPlannerBikingOptionsComponent } from './trip-planner-biking-options.component';
import { TripPlannerService } from '../../../../services/trip-planner.service';
import { TripPlannerConnectionService } from '../../../../services/trip-planner-connection.service';
import { BusService } from '../../../../services/transportation/bus/bus.service';
import { BikeService } from '../../../../services/transportation/bike/bike.service';
import { InrixService } from '../../../../services/transportation/drive/inrix.service';

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
          useValue: { SearchSources: [], NotificationEvents: [], LayerSources: [], RegionalBoundary: {} }
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
