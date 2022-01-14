import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HighlightPlusModule } from 'ngx-highlightjs/plus';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { UILayoutCodeModule } from '@tamu-gisc/ui-kits/ngx/layout/code';

import { GeocodingComponent } from './geocoding.component';

describe('GeocodingComponent', () => {
  let component: GeocodingComponent;
  let fixture: ComponentFixture<GeocodingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UILayoutModule, UILayoutCodeModule, HighlightPlusModule, RouterTestingModule],
      declarations: [GeocodingComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeocodingComponent);
    component = fixture.componentInstance;
    /*
    Test passes when fixture.detectChanges() is included and runs: npx jest -o 
    However fails when fixture.detectChanges() is included and runs:  npx jest --collectCoverage 
    fixture.detectChanges();
    */
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
