import { async, inject, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { Angulartics2Module } from 'angulartics2';
import { LOCAL_STORAGE, StorageServiceModule } from 'ngx-webstorage-service';

import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { SearchModule } from '@tamu-gisc/search';

import { TripPlannerOptionsComponentService } from './trip-planner-options-component.service';
import { TripPlannerService } from '../../../services/trip-planner.service';
import { TripPlannerConnectionService } from '../../../services/trip-planner-connection.service';
import { BusService } from '../../../services/transportation/bus/bus.service';
import { BikeService } from '../../../services/transportation/bike/bike.service';
import { InrixService } from '../../../services/transportation/drive/inrix.service';

describe('TripPlannerOptionsComponentService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        EsriMapModule,
        SearchModule,
        HttpClientTestingModule,
        EnvironmentModule,
        Angulartics2Module.forRoot(),
        StorageServiceModule
      ],
      providers: [
        TripPlannerOptionsComponentService,
        TripPlannerService,
        TripPlannerConnectionService,
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
      ]
    }).compileComponents();
  }));

  it('should be created', inject([TripPlannerOptionsComponentService], (service: TripPlannerOptionsComponentService) => {
    expect(service).toBeTruthy();
  }));
});
