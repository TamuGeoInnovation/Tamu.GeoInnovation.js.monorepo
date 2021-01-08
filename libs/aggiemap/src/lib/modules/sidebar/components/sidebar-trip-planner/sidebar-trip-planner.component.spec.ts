import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { MapsFeatureTripPlannerModule } from '@tamu-gisc/maps/feature/trip-planner';
import { SearchModule } from '@tamu-gisc/search';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';

import { Angulartics2Module, RouterlessTracking } from 'angulartics2';
import { LOCAL_STORAGE, StorageServiceModule } from 'ngx-webstorage-service';

import { SidebarTripPlannerComponent } from './sidebar-trip-planner.component';

describe('SidebarTripPlannerComponent', () => {
  let component: SidebarTripPlannerComponent;
  let fixture: ComponentFixture<SidebarTripPlannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        StorageServiceModule,
        SearchModule,
        MapsFeatureTripPlannerModule,
        RouterTestingModule,
        HttpClientTestingModule,
        EnvironmentModule,
        Angulartics2Module.forRoot()
      ],
      declarations: [SidebarTripPlannerComponent],
      providers: [
        RouterlessTracking,
        { provide: AppStorage, useExisting: LOCAL_STORAGE },
        { provide: env, useValue: { SearchSources: [], NotificationEvents: [], LayerSources: [] } }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarTripPlannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
