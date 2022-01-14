import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { MapsMapboxModule } from '@tamu-gisc/maps/mapbox';

import { TimeMapComponent } from './time-map.component';

describe('TimeMapComponent', () => {
  let component: TimeMapComponent;
  let fixture: ComponentFixture<TimeMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UIFormsModule, UILayoutModule, MapsMapboxModule, HttpClientTestingModule, BrowserAnimationsModule],
      declarations: [TimeMapComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
