import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';
import { SearchService } from '@tamu-gisc/ui-kits/ngx/search';

import { LactationPopupComponent } from './lactation.component';

/**
 * The lactation room popup reads the hosted Lactation_Spaces_view service's fields (#1960).
 *
 * Every field changed name when the layer moved from FCOR/MapInfo_20190529, and `notes` stopped being
 * an address: it is prose with an email and its own links, so it is shown as text, not put into a
 * link. The room below is one of the service's own, as it answered on 19 October 2026.
 */
const NOTES =
  'For access, more information or questions regarding the room, please contact Christine Green, Facilities Coordinator, at c.green@tamu.edu.' +
  '<br><br><a href="https://titleix.tamu.edu/title-ix-and-pregnancy-students/lactation-spaces/" target="_blank">On Campus Lactation Spaces</a>';

const ROOM = {
  objectid: 1,
  bldgnum: '0275',
  bldgname: 'Liberal Arts and Humanities (LAAH)',
  availability_type: 'Public',
  availability_times: 'Mon. - Fri. 8am - 5pm',
  access: 'Room 111.<br><br>LAAH 111 is located on the first floor next to a familiy restroom (112).',
  amenities: 'It has a sink, a soap dispenser, a chair, an outlet, and a table.',
  notes: NOTES
};

describe('LactationPopupComponent', () => {
  let fixture: ComponentFixture<LactationPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LactationPopupComponent],
      providers: [
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: ActivatedRoute, useValue: {} },
        { provide: TripPlannerService, useValue: { Stops: of([]), setStops: vi.fn() } },
        { provide: Angulartics2, useValue: { eventTrack: { next: vi.fn() } } },
        { provide: EsriMapService, useValue: { clearHitTest: vi.fn() } },
        { provide: SearchService, useValue: { getSource: vi.fn().mockReturnValue({ urlQueryParam: 'lactation' }) } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(LactationPopupComponent);
  });

  function render(attributes: Record<string, unknown>): HTMLElement {
    fixture.componentInstance.data = { attributes } as unknown as __esri.Graphic;
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  it('shows the building name and number, when the room is available, how to reach it and what it has', () => {
    const text = render(ROOM).textContent ?? '';

    expect(text).toContain('Liberal Arts and Humanities (LAAH)');
    expect(text).toContain('Building 0275');
    expect(text).toContain('Public');
    expect(text).toContain('Mon. - Fri. 8am - 5pm');
    expect(text).toContain('LAAH 111 is located on the first floor');
    expect(text).toContain('It has a sink, a soap dispenser');
  });

  it('shows the notes as text, keeping their own links, not as a link to the notes', () => {
    const popup = render(ROOM);
    const hrefs = Array.from(popup.querySelectorAll('a')).map((a) => a.getAttribute('href'));

    expect(popup.textContent).toContain('c.green@tamu.edu');
    expect(popup.innerHTML).not.toContain('&lt;br');
    expect(hrefs).not.toContain(NOTES);
    expect(hrefs).toContain('https://titleix.tamu.edu/title-ix-and-pregnancy-students/lactation-spaces/');
  });

  it('leaves out a row the room has no value for', () => {
    const text = render({ ...ROOM, amenities: null }).textContent ?? '';

    expect(text).not.toContain('Amenities');
    expect(text).toContain('Access');
  });
});
