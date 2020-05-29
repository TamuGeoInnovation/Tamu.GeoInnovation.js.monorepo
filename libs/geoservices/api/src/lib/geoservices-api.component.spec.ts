import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { UIScrollToModule } from '@tamu-gisc/ui-kits/ngx/interactions/scroll-to';

import { GeoservicesApiComponent } from './geoservices-api.component';

describe('GeoservicesApiComponent', () => {
  let component: GeoservicesApiComponent;
  let fixture: ComponentFixture<GeoservicesApiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, UILayoutModule, UIScrollToModule, RouterTestingModule, BrowserAnimationsModule],
      declarations: [GeoservicesApiComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoservicesApiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
