import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { BusRouteComponent } from './bus-route.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { BusService } from '../../../../../../services/transportation/bus/bus.service';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchModule } from '@tamu-gisc/search';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';

describe('BusRouteComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EsriMapModule, RouterTestingModule, SearchModule, EnvironmentModule],
      providers: [
        BusRouteComponent,
        BusService,
        {
          provide: env,
          useValue: { SearchSources: [] }
        }
      ]
    }).compileComponents();
  }));

  it('should create', inject([BusRouteComponent], (component: BusRouteComponent) => {
    expect(component).toBeTruthy();
  }));
});
