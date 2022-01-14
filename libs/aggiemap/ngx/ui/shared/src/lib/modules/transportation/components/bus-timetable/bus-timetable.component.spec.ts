import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { SearchModule } from '@tamu-gisc/ui-kits/ngx/search';
import { BusService } from '@tamu-gisc/maps/feature/trip-planner';

import { BusTimetableComponent } from './bus-timetable.component';

describe('BusTimetableComponent (isolated)', () => {
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

describe('BusTimeTableComponent (integrated)', () => {
  let fixture: ComponentFixture<BusTimetableComponent>;
  let component: BusTimetableComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EsriMapModule, RouterTestingModule, SearchModule, EnvironmentModule],
      declarations: [BusTimetableComponent],
      providers: [
        BusService,
        {
          provide: env,
          useValue: { SearchSources: [] }
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
