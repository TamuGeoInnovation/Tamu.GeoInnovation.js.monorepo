import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { TripPlannerBusModeSwitchComponent } from './bus-switch.component';
import { BusService } from '../../../../../services/transportation/bus/bus.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchModule } from '@tamu-gisc/search';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';

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
