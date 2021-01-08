import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { Angulartics2Module, RouterlessTracking } from 'angulartics2';
import { LOCAL_STORAGE } from 'ngx-webstorage-service';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';
import { MapsFeatureTripPlannerModule } from '@tamu-gisc/maps/feature/trip-planner';
import { UIDragModule } from '@tamu-gisc/ui-kits/ngx/interactions/draggable';

import { TripPlannerBottomComponent } from './trip-planner-bottom.component';

describe('TripPlannerBottomComponent', () => {
  let component: TripPlannerBottomComponent;
  let fixture: ComponentFixture<TripPlannerBottomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UIDragModule,
        MapsFeatureTripPlannerModule,
        RouterTestingModule,
        HttpClientTestingModule,
        EnvironmentModule,
        Angulartics2Module.forRoot()
      ],
      declarations: [TripPlannerBottomComponent],
      providers: [
        RouterlessTracking,
        {
          provide: env,
          useValue: { SearchSources: [], NotificationEvents: [], LayerSources: [] }
        },
        { provide: AppStorage, useExisting: LOCAL_STORAGE }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TripPlannerBottomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
