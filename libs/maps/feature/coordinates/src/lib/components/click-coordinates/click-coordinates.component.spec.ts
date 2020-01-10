import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { SearchModule } from '@tamu-gisc/search';

import { ClickCoordinatesComponent } from './click-coordinates.component';

describe('ClickCoordinatesComponent (shallow)', () => {
  let component: ClickCoordinatesComponent;
  let fixture: ComponentFixture<ClickCoordinatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, EsriMapModule, SearchModule, EnvironmentModule],
      declarations: [ClickCoordinatesComponent],
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
    fixture = TestBed.createComponent(ClickCoordinatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
