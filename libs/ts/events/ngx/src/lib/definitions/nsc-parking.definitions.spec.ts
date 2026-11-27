import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

// The definitions, their popups and the settings service import one another. Loading the service
// first is the order the application loads them in; starting from a definition finds a popup's base
// class still undefined.
import '../services/settings/event-settings.service';

import { EsriMapService, loadPopupComponent } from '@tamu-gisc/maps/esri';
import { resolvePopupData } from '@tamu-gisc/maps/feature/popup';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';
import { SearchService } from '@tamu-gisc/ui-kits/ngx/search';

import { NscParkingColdLayerSources, NscParkingDefinitions } from './nsc-parking.definitions';

/**
 * The New Student Conference parking map's lot popup shows the lot's permit instructions (#3671). They were fetched under
 * the key `notes`, which the markdown popup does not read, so every lot showed only its name. Resolved here through the
 * layer's own popup data and drawn by the popup itself, as a click on a lot would: a test of the definition alone would
 * pass on any key name. The service's own lots answer no geometry today (#2520), so the smoke suite cannot click one.
 */
describe('NSC parking lot popup (#3671)', () => {
  const NOTE = 'Register for a permit on our website: <a href="https://transport.tamu.edu/myaccount">My Account</a>';

  it("shows the lot's name and its permit instructions", async () => {
    const lots = NscParkingColdLayerSources.find((layer) => layer.id === NscParkingDefinitions.NSC_PARKING_LOTS.id);
    const feature = {
      attributes: { 'GIS.TS.ParkingLots.Name': 'Lot 100g', 'GIS.TS.Lot_Notes.NewStudentConfN': NOTE },
      layer: { title: 'NSC Parking Lots' }
    } as unknown as __esri.Graphic;

    // As PopupService opens it: the layer's own popup component, given the feature's attributes with its popup data
    // resolved over them.
    const resolved = resolvePopupData(feature, lots?.popupData ?? {}, lots?.popupDataResolutionStrategy ?? 'independent');
    const attributes = { ...feature.attributes, ...resolved };
    const popup = await loadPopupComponent(lots?.popupComponent as Parameters<typeof loadPopupComponent>[0]);

    TestBed.configureTestingModule({
      imports: [popup],
      providers: [
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: ActivatedRoute, useValue: {} },
        { provide: TripPlannerService, useValue: { Stops: of([]), setStops: vi.fn() } },
        { provide: Angulartics2, useValue: { eventTrack: { next: vi.fn() } } },
        { provide: EsriMapService, useValue: { clearHitTest: vi.fn() } },
        { provide: SearchService, useValue: { getSource: vi.fn() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    const fixture = TestBed.createComponent(popup as never) as unknown as {
      componentInstance: { data: __esri.Graphic };
      detectChanges(): void;
      nativeElement: HTMLElement;
    };
    fixture.componentInstance.data = { attributes, layer: feature.layer } as unknown as __esri.Graphic;
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.feature-style-1')?.textContent?.trim()).toBe('Lot 100g');
    expect(element.textContent).toContain('Register for a permit on our website');
    expect(element.querySelector('a[href="https://transport.tamu.edu/myaccount"]')).not.toBeNull();
  });
});
