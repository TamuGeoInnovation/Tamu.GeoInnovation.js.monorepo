import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';
import { SearchService } from '@tamu-gisc/ui-kits/ngx/search';

import { amenitiesOf, NatureRxPopupComponent } from './nature-rx.component';

/**
 * The Nature Rx popup lists what a space has as one labelled line, as every other popup shows a field (#2717).
 *
 * It was the only popup in the repository with a `<ul>`, and no popup stylesheet styles one, so the features fell
 * back to the browser's own bullets and indent and read as a form dropped into the panel. The order and the rule
 * that only what a space has is listed are #2630's, unchanged.
 *
 * The space below is West Campus Spaces as the NatureRx_view service answered on 8 November 2026, without its
 * photograph, so no carousel is drawn.
 */
const WEST_CAMPUS_SPACES = {
  objectid: 15,
  area_name: 'West Campus Spaces',
  location: 'West Campus',
  description: 'The outdoor spaces between the HEEP Center and Kleberg Center are landscaped green areas.',
  restrooms: 'No',
  seating: 'Yes',
  tables: 'No',
  shade: 'Yes',
  open_play_area: 'Yes',
  walk_jog_path: 'Yes ',
  bike_racks: 'yes',
  memorial: null
};

describe('NatureRxPopupComponent', () => {
  let fixture: ComponentFixture<NatureRxPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NatureRxPopupComponent],
      providers: [
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: ActivatedRoute, useValue: {} },
        { provide: TripPlannerService, useValue: { Stops: of([]), setStops: vi.fn() } },
        { provide: Angulartics2, useValue: { eventTrack: { next: vi.fn() } } },
        { provide: EsriMapService, useValue: { clearHitTest: vi.fn() } },
        { provide: SearchService, useValue: { getSource: vi.fn().mockReturnValue({ urlQueryParam: 'naturerx' }) } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(NatureRxPopupComponent);
  });

  function render(attributes: Record<string, unknown>): HTMLElement {
    fixture.componentInstance.data = { attributes } as unknown as __esri.Graphic;
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  /** The popup's field lines, as text with their spacing collapsed. */
  function lines(popup: HTMLElement): Array<string> {
    return Array.from(popup.querySelectorAll('.feature-style-2')).map((line) =>
      (line.textContent ?? '').replace(/\s+/g, ' ').trim()
    );
  }

  it('lists the features as one labelled line, in the service order, only those the space has', () => {
    expect(lines(render(WEST_CAMPUS_SPACES))).toContain(
      'Features: Seating, Shade, Open play area, Walking or jogging path, Bike racks'
    );
  });

  it('labels the line in bold, as the other popups label theirs, and draws no list', () => {
    const popup = render(WEST_CAMPUS_SPACES);

    expect(popup.querySelector('.feature-style-2 strong')?.textContent).toBe('Features');
    expect(popup.querySelectorAll('ul, ol, li')).toHaveLength(0);
  });

  it('leaves the line out for a space with no features', () => {
    const popup = render({
      ...WEST_CAMPUS_SPACES,
      seating: 'No',
      shade: 'No',
      open_play_area: 'No',
      walk_jog_path: '',
      bike_racks: null
    });

    expect(popup.textContent).not.toContain('Features');
  });

  it('still lists exactly what amenitiesOf gives, so the line and #2630 rule cannot drift apart', () => {
    const popup = render(WEST_CAMPUS_SPACES);

    expect(lines(popup)).toContain(`Features: ${amenitiesOf(WEST_CAMPUS_SPACES).join(', ')}`);
  });
});
