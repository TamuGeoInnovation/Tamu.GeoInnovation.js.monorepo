import { waitForAsync, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { Angulartics2 } from 'angulartics2';

import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { EsriMapComponent } from '@tamu-gisc/maps/esri';
import { SearchComponent, SearchMobileComponent, SearchResultPipe } from '@tamu-gisc/ui-kits/ngx/search';
import { BusService } from '@tamu-gisc/maps/feature/trip-planner';

import { BusTimetableComponent } from './bus-timetable.component';

describe('BusTimetableComponent (isolated)', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        EsriMapComponent,
        RouterTestingModule,
        SearchComponent,
        SearchMobileComponent,
        SearchResultPipe,
        EnvironmentModule
      ],
      providers: [
        BusTimetableComponent,
        BusService,
        {
          // BusService injects Angulartics2, which needs RouterlessTracking. Mocked rather
          // than importing the real module, matching parking-lot.component.spec.ts.
          provide: Angulartics2,
          useValue: { eventTrack: { next: jest.fn() } }
        },
        {
          provide: env,
          useValue: { SearchSources: [], LayerSources: [] }
        }
      ]
    }).compileComponents();
  }));

  it('should create', inject([BusTimetableComponent], (component: BusTimetableComponent) => {
    expect(component).toBeTruthy();
  }));
});

describe('BusTimeTableComponent (integrated)', () => {
  let fixture: ComponentFixture<BusTimetableComponent>;
  let component: BusTimetableComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        EsriMapComponent,
        RouterTestingModule,
        SearchComponent,
        SearchMobileComponent,
        SearchResultPipe,
        EnvironmentModule,
        BusTimetableComponent
      ],
      providers: [
        {
          // The integrated block has its own TestBed and needs the same Angulartics2 mock.
          provide: Angulartics2,
          useValue: { eventTrack: { next: jest.fn() } }
        },
        BusService,
        {
          provide: env,
          useValue: { SearchSources: [], LayerSources: [] }
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusTimetableComponent);
    component = fixture.componentInstance;

    component.route = {
      Color: 'color',
      Description: 'description',
      Group: {
        IsGameDay: false,
        Name: 'name',
        Order: 0
      },
      Icon: 'icon',
      Key: 'key',
      Name: 'name',
      ShortName: 'short name'
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
