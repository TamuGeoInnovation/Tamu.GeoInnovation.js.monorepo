import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { MapsFeatureAccessibilityModule } from '@tamu-gisc/maps/feature/accessibility';
import { MapsFeatureCoordinatesModule } from '@tamu-gisc/maps/feature/coordinates';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';
import { LayerListModule } from '@tamu-gisc/maps/feature/layer-list';
import { UESCoreUIModule } from '@tamu-gisc/ues/common/ngx';
import { EsriMapModule } from '@tamu-gisc/maps/esri';

import { MapComponent } from './map.component';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UITamuBrandingModule,
        MapsFeatureCoordinatesModule,
        EsriMapModule,
        RouterTestingModule,
        MapsFeatureAccessibilityModule,
        UESCoreUIModule,
        EnvironmentModule,
        LayerListModule,
        HttpClientTestingModule
      ],
      declarations: [MapComponent],
      providers: [
        {
          provide: env,
          useValue: { SearchSources: [], LayerSources: [], apiUrl: [], Connections: [] }
        }
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
