import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MapsFeatureAccessibilityModule } from '@tamu-gisc/maps/feature/accessibility';
import { MapsFeatureCoordinatesModule } from '@tamu-gisc/maps/feature/coordinates';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';
import { EsriMapModule } from '@tamu-gisc/maps/esri';

import { UESTamuBlockComponent } from '../core-ui/components/branding/ues-tamu-block/ues-tamu-block.component';

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
        EnvironmentModule,
        HttpClientTestingModule
      ],
      declarations: [MapComponent, UESTamuBlockComponent],
      providers: [{ provide: env, useValue: { SearchSources: [], Connections: [], LayerSources: [] } }]
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
