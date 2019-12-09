import { async, inject, TestBed } from '@angular/core/testing';

import { TripPlannerOptionsBaseComponent } from './base.component';
import { Angulartics2Module } from 'angulartics2';
import { RouterTestingModule } from '@angular/router/testing';
import { TripPlannerService } from '../../../../../services/trip-planner/trip-planner.service';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { SearchModule } from '@tamu-gisc/search';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { TripPlannerConnectionService } from '../../../../../services/trip-planner/trip-planner-connection.service';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';
import { LOCAL_STORAGE, StorageServiceModule } from 'angular-webstorage-service';
import { BusService } from '../../../../../services/transportation/bus/bus.service';
import { BikeService } from '../../../../../services/transportation/bike/bike.service';
import { InrixService } from '../../../../../services/transportation/drive/inrix.service';

describe('TripPlannerParkingOptionsBaseComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        Angulartics2Module.forRoot(),
        RouterTestingModule,
        EsriMapModule,
        SearchModule,
        HttpClientTestingModule,
        EnvironmentModule,
        StorageServiceModule
      ],
      providers: [
        TripPlannerOptionsBaseComponent,
        TripPlannerService,
        TripPlannerConnectionService,
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
      ]
    }).compileComponents();
  }));

  it('should create', inject([TripPlannerOptionsBaseComponent], (component: TripPlannerOptionsBaseComponent) => {
    expect(component).toBeTruthy();
  }));
});
