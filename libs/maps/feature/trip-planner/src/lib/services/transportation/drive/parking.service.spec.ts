import { async, inject, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { LOCAL_STORAGE, StorageServiceModule } from 'angular-webstorage-service';

import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { SearchModule } from '@tamu-gisc/search';

import { ParkingService } from './parking.service';

describe('ParkingService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [EsriMapModule, SearchModule, HttpClientTestingModule, EnvironmentModule, StorageServiceModule],
      providers: [
        ParkingService,
        {
          provide: env,
          useValue: { SearchSources: [] }
        },
        {
          provide: AppStorage,
          useExisting: LOCAL_STORAGE
        }
      ]
    }).compileComponents();
  }));

  it('should be created', inject([ParkingService], (component: ParkingService) => {
    expect(component).toBeTruthy();
  }));
});
