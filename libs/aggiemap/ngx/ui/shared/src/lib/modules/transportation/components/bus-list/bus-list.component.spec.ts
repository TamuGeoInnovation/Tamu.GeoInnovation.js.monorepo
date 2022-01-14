import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { ResponsiveModule } from '@tamu-gisc/dev-tools/responsive';
import { MapsFeatureTripPlannerModule } from '@tamu-gisc/maps/feature/trip-planner';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { SearchModule } from '@tamu-gisc/ui-kits/ngx/search';

import { BusListComponent } from './bus-list.component';

describe('BusListComponent (Isolated)', () => {
  const component: BusListComponent = new BusListComponent(undefined, undefined, undefined, undefined);

  it('should instantiate', () => {
    expect(component).toBeDefined();
  });
});

describe('BusListComponent (Shallow)', () => {
  let component: BusListComponent;
  let fixture: ComponentFixture<BusListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        ResponsiveModule,
        EsriMapModule,
        MapsFeatureTripPlannerModule,
        SearchModule,
        EnvironmentModule
      ],
      declarations: [BusListComponent],
      providers: [
        {
          provide: env,
          useValue: { SearchSources: [] }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
