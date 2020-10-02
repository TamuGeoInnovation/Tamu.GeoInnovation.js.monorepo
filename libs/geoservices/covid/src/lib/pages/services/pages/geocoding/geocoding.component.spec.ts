import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HighlightPlusModule } from 'ngx-highlightjs/plus/';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { UILayoutCodeModule } from '@tamu-gisc/ui-kits/ngx/layout/code';

import { GeocodingComponent } from './geocoding.component';

describe('GeocodingComponent', () => {
  let component: GeocodingComponent;
  let fixture: ComponentFixture<GeocodingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UILayoutModule,
        HttpClientTestingModule,
        UILayoutCodeModule,
        UILayoutModule,
        HighlightPlusModule,
        RouterTestingModule
      ],
      declarations: [GeocodingComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeocodingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
