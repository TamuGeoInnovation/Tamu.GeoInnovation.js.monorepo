import { async, inject, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { SearchModule } from '@tamu-gisc/ui-kits/ngx/search';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';

import { TripPlannerBusModeSwitchComponent } from './bus-switch.component';
import { BusService } from '../../../../services/transportation/bus/bus.service';

describe('BusSwitchComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EsriMapModule, RouterTestingModule, SearchModule, EnvironmentModule],
      providers: [
        TripPlannerBusModeSwitchComponent,
        BusService,
        {
          provide: env,
          useValue: { SearchSources: [] }
        }
      ]
    }).compileComponents();
  }));

  it('should create', inject([TripPlannerBusModeSwitchComponent], (component: TripPlannerBusModeSwitchComponent) => {
    expect(component).toBeTruthy();
  }));
});
