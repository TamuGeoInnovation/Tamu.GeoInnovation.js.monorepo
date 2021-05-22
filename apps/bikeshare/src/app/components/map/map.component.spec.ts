import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule, BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { SearchModule } from '@tamu-gisc/search';

import { MapComponent } from './map.component';
import { SidebarModule } from '@tamu-gisc/common/ngx/ui/sidebar';
import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';
import { LayerListModule } from '@tamu-gisc/maps/feature/layer-list';
import { DateRange } from '../date-picker/date.component';

import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { FormsModule } from '@angular/forms';
import { ResponsiveModule } from '@tamu-gisc/dev-tools/responsive';
import { RouterHistoryService } from '@tamu-gisc/common/ngx/router';

describe('MapComponent', () => {
  let fixture: ComponentFixture<MapComponent>;
  let component: MapComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        BrowserAnimationsModule,
        EnvironmentModule,
        EsriMapModule,
        RouterTestingModule,
        SearchModule,
        HttpClientTestingModule,
        SidebarModule,
        UITamuBrandingModule,
        LayerListModule,
        OwlDateTimeModule,
        OwlNativeDateTimeModule,
        ResponsiveModule
      ],
      declarations: [MapComponent, DateRange],
      providers: [
        {
          provide: env,
          useValue: { LayerSources: [], SearchSources: [] }
        },
        RouterHistoryService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
