import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';
import { SearchService } from '@tamu-gisc/ui-kits/ngx/search';

import { AccessiblePopupComponent } from './accessible.component';

/**
 * The Accessible Building Entrances popup reads layer 0 of FCOR/ADA_120717. The entrance below is one of the service's
 * own, as it answered on 25 November 2026, with the fields the popup and the trip planner read.
 */
const ENTRANCE = {
  BldgNumber: '0492',
  BldgAbbrev: 'CVE',
  Category: 'Powered Accessible entrance',
  'GIS.FCOR.Bldg_Entrance.FID': 2
};

describe('AccessiblePopupComponent', () => {
  let fixture: ComponentFixture<AccessiblePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessiblePopupComponent],
      providers: [
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: ActivatedRoute, useValue: {} },
        { provide: TripPlannerService, useValue: { Stops: of([]), setStops: vi.fn() } },
        { provide: Angulartics2, useValue: { eventTrack: { next: vi.fn() } } },
        { provide: EsriMapService, useValue: { clearHitTest: vi.fn() } },
        { provide: SearchService, useValue: { getSource: vi.fn().mockReturnValue(undefined) } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AccessiblePopupComponent);
  });

  function render(attributes: Record<string, unknown>): HTMLElement {
    fixture.componentInstance.data = { attributes } as unknown as __esri.Graphic;
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  it('names the kind of entrance', () => {
    expect(render(ENTRANCE).textContent).toContain('Category: Powered Accessible entrance');
  });

  // An entrance is a door, the one place a wheelchair user most needs routing to (#602).
  it('offers "Directions To Here", which plans a trip to the entrance (#602)', () => {
    const popup = render(ENTRANCE);
    const button = Array.from(popup.querySelectorAll<HTMLElement>('.button')).find(
      (element) => element.textContent?.trim() === 'Directions To Here'
    );

    expect(button, 'the accessible entrance popup offers no "Directions To Here"').toBeDefined();

    button?.click();

    const stops = vi.mocked(TestBed.inject(TripPlannerService).setStops).mock.calls[0]?.[0];
    expect(stops?.[0]?.originAttributes).toEqual(ENTRANCE);
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['trip'], expect.anything());
  });

  // No search source opens an entrance from a link, so a copied link would reopen nothing (#1173).
  it('offers no copy link, because no link reopens an entrance', () => {
    expect(render(ENTRANCE).querySelector('tamu-gisc-copy-field')).toBeNull();
  });
});
