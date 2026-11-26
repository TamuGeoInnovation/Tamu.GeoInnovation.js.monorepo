import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';
import { SearchService } from '@tamu-gisc/ui-kits/ngx/search';

import { ParkingKioskPopupComponent } from './parking-kiosk.component';

/**
 * The Visitor Parking popup reads layer 4 of TS_Main, the visitor kiosks: points, each a pay station a visitor drives
 * to. The kiosk below is one of the service's own, as it answered on 25 November 2026.
 */
const KIOSK = { OBJECTID: 3, Type: 'PBC' };

describe('ParkingKioskPopupComponent', () => {
  let fixture: ComponentFixture<ParkingKioskPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParkingKioskPopupComponent],
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

    fixture = TestBed.createComponent(ParkingKioskPopupComponent);
  });

  function render(attributes: Record<string, unknown>): HTMLElement {
    fixture.componentInstance.data = { attributes } as unknown as __esri.Graphic;
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  it('offers "Directions To Here", which plans a trip to the kiosk (#602)', () => {
    const popup = render(KIOSK);
    const button = Array.from(popup.querySelectorAll<HTMLElement>('.button')).find(
      (element) => element.textContent?.trim() === 'Directions To Here'
    );

    expect(button, 'the visitor parking kiosk popup offers no "Directions To Here"').toBeDefined();

    button?.click();

    const stops = vi.mocked(TestBed.inject(TripPlannerService).setStops).mock.calls[0]?.[0];
    expect(stops?.[0]?.originAttributes).toEqual(KIOSK);
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['trip'], expect.anything());
  });

  // No search source opens a kiosk from a link, so a copied link would reopen nothing (#1173).
  it('offers no copy link, because no link reopens a kiosk', () => {
    expect(render(KIOSK).querySelector('tamu-gisc-copy-field')).toBeNull();
  });
});
