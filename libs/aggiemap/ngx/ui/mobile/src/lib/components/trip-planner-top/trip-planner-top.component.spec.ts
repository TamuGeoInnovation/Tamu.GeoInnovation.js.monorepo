import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NEVER, of } from 'rxjs';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';
import { DragService } from '@tamu-gisc/ui-kits/ngx/interactions/draggable';

import { TripPlannerTopComponent } from './trip-planner-top.component';

/**
 * The phone's trip planner is offered on every environment, as the desktop sidebar's is (#2804). It was
 * development-only, with a maintenance message elsewhere, while the routing network was not on production (#683).
 */
describe('TripPlannerTopComponent', () => {
  function render(isTesting: boolean): HTMLElement {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: TestingService, useValue: { get: () => of(isTesting) } },
        {
          provide: TripPlannerService,
          useValue: { Stops: of([{ index: 0 }, { index: 1 }]), TravelOptions: NEVER }
        },
        { provide: EsriMapService, useValue: { store: NEVER } },
        { provide: DragService, useValue: { states: NEVER } }
      ]
    });

    // The mode picker is left as an element: what is asked here is which of the two this renders.
    TestBed.overrideComponent(TripPlannerTopComponent, {
      set: { imports: [AsyncPipe], schemas: [CUSTOM_ELEMENTS_SCHEMA] }
    });

    const fixture = TestBed.createComponent(TripPlannerTopComponent);
    fixture.detectChanges();

    return fixture.nativeElement;
  }

  afterEach(() => TestBed.resetTestingModule());

  it.each([true, false])(
    'offers the from and to boxes and the travel modes, with development-only features on: %s',
    (isTesting) => {
      const element = render(isTesting);

      const boxes = Array.from(element.querySelectorAll<HTMLInputElement>('.points input'));

      expect(boxes.length).toBe(2);
      // A stop not yet chosen has no name: an empty box, not the word "undefined".
      expect(boxes.map((box) => box.value)).toEqual(['', '']);
      expect(element.querySelector('tamu-gisc-trip-planner-mode-picker-mobile')).not.toBeNull();
      expect(element.querySelector('.maintenance-message')).toBeNull();
    }
  );
});
