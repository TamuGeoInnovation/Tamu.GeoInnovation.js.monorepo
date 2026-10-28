import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';
import { SearchService } from '@tamu-gisc/ui-kits/ngx/search';

import { RestroomPopupComponent } from './restroom.component';

/**
 * The Single Occupancy Restroom popup reads layer 1 of FCOR/MapInfo_20190529 (#1961).
 *
 * The service names the building number `BldgNum`; the popup read `Bldg_Number`, which it does not
 * have, so "Building Number:" was always empty. The restroom below is one of the service's own, as it
 * answered on 28 October 2026. Its `Notes` are written with <br>, so they are rendered as HTML.
 */
const RESTROOM = {
  OBJECTID: 407,
  BldgNum: '0416',
  Name: 'Student Services Building',
  Type: 'Unisex Restroom',
  Notes: '1st Floor, Room R105; <br>2nd Floor, Room 205; <br>3rd Floor, Room 305; <br>4th Floor, Room 405'
};

describe('RestroomPopupComponent', () => {
  let fixture: ComponentFixture<RestroomPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestroomPopupComponent],
      providers: [
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: ActivatedRoute, useValue: {} },
        { provide: TripPlannerService, useValue: { Stops: of([]), setStops: vi.fn() } },
        { provide: Angulartics2, useValue: { eventTrack: { next: vi.fn() } } },
        { provide: EsriMapService, useValue: { clearHitTest: vi.fn() } },
        { provide: SearchService, useValue: { getSource: vi.fn().mockReturnValue({ urlQueryParam: 'restroom' }) } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RestroomPopupComponent);
  });

  function render(attributes: Record<string, unknown>): HTMLElement {
    fixture.componentInstance.data = { attributes } as unknown as __esri.Graphic;
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  it('shows the building name and number, and where the restrooms are in it', () => {
    const popup = render(RESTROOM);
    const text = popup.textContent ?? '';

    expect(text).toContain('Student Services Building');
    expect(text).toContain('Building 0416');
    expect(text).toContain('4th Floor, Room 405');
    expect(popup.innerHTML).not.toContain('&lt;br');
  });

  it('leaves out the building number when the restroom has none, rather than an empty row', () => {
    const text = render({ ...RESTROOM, BldgNum: null }).textContent ?? '';

    expect(text).not.toMatch(/Building( Number)?:?\s*$/m);
    expect(text).not.toContain('Building Number');
    expect(text).toContain('Student Services Building');
  });
});
