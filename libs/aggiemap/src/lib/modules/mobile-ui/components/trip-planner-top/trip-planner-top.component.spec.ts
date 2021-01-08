import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { RouterlessTracking } from 'angulartics2';
import { Angulartics2Module } from 'angulartics2';
import { LOCAL_STORAGE } from 'ngx-webstorage-service';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { MapsFeatureTripPlannerModule } from '@tamu-gisc/maps/feature/trip-planner';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';

import { TripPlannerTopComponent } from './trip-planner-top.component';

describe('TripPlannerTopComponent', () => {
  let component: TripPlannerTopComponent;
  let fixture: ComponentFixture<TripPlannerTopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MapsFeatureTripPlannerModule,
        RouterTestingModule,
        HttpClientTestingModule,
        EnvironmentModule,
        Angulartics2Module.forRoot(),
        BrowserAnimationsModule
      ],
      declarations: [TripPlannerTopComponent],
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
    fixture = TestBed.createComponent(TripPlannerTopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
