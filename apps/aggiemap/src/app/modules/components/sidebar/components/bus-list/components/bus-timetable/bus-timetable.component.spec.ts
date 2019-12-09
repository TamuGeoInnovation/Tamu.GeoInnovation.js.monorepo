import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { BusTimetableComponent } from './bus-timetable.component';
import { BusService } from '../../../../../../services/transportation/bus/bus.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchModule } from '@tamu-gisc/search';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';

describe('BusTimetableComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EsriMapModule, RouterTestingModule, SearchModule, EnvironmentModule],
      providers: [
        BusTimetableComponent,
        BusService,
        {
          provide: env,
          useValue: { SearchSources: [] }
        }
      ]
    }).compileComponents();
  }));

  it('should create', inject([BusTimetableComponent], (component: BusTimetableComponent) => {
    expect(component).toBeTruthy();
  }));
});
