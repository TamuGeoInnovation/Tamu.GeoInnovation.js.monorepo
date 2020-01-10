import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { SearchModule } from '@tamu-gisc/search';

import { MapViewfinderComponent } from './viewfinder.component';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

describe('MapViewfinderComponent (shallow)', () => {
  let component: MapViewfinderComponent;
  let fixture: ComponentFixture<MapViewfinderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, EnvironmentModule, EsriMapModule, SearchModule],
      declarations: [MapViewfinderComponent],
      providers: [
        {
          provide: env,
          useValue: { LayerSources: [], SearchSources: [] }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapViewfinderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
