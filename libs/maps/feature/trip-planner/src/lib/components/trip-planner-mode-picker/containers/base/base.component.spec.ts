import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink } from '@angular/router';
import { of } from 'rxjs';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { TripPlannerService } from '../../../../services/trip-planner.service';
import { TripPlannerModePickerComponent } from './base.component';

/**
 * The trip planner's Options link is offered only where development-only features are on (#2801).
 *
 * Options offers only accessible routing, which the routing network does not support yet. Its page is gated on its
 * route too, which the smoke suite proves on a deployed build; this proves the link itself, because on production the
 * whole trip planner is development-only today, so no deployed build can show the link's own gate.
 */
describe('TripPlannerModePickerComponent', () => {
  const walk = { modes: [] };

  function render(isTesting: boolean, travelMode = 1): HTMLElement {
    TestBed.configureTestingModule({
      imports: [TripPlannerModePickerComponent],
      providers: [
        provideRouter([]),
        { provide: TestingService, useValue: { get: () => of(isTesting) } },
        {
          provide: TripPlannerService,
          useValue: {
            TravelOptions: of({ travel_mode: travelMode, shade: false }),
            rule_walk: walk,
            getRuleForModes: ([mode]: number[]) => ([1, 2, 9, 10].includes(mode) ? walk : { modes: [] })
          }
        }
      ]
    });

    // The travel-mode toggles and the time picker are not what is tested, and need the planner's services.
    TestBed.overrideComponent(TripPlannerModePickerComponent, {
      set: { imports: [RouterLink, AsyncPipe], schemas: [CUSTOM_ELEMENTS_SCHEMA] }
    });

    const fixture = TestBed.createComponent(TripPlannerModePickerComponent);

    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  const options = (element: HTMLElement) =>
    Array.from(element.querySelectorAll('.options-container .action')).filter(
      (link) => link.textContent?.trim() === 'Options'
    );

  it('does not offer Options where development-only features are off', () => {
    expect(options(render(false))).toHaveLength(0);
  });

  it('offers Options where development-only features are on', () => {
    expect(options(render(true))).toHaveLength(1);
  });

  // The shade-aware walking prototype's switch: development only, and only for a walk.
  const shadeOption = (element: HTMLElement) => element.querySelectorAll('.shade-option');

  it('offers Prefer shade for a walk where development-only features are on', () => {
    expect(shadeOption(render(true, 1))).toHaveLength(1);
  });

  it('does not offer Prefer shade where development-only features are off, or for a bike ride', () => {
    expect(shadeOption(render(false, 1))).toHaveLength(0);
  });

  it('does not offer Prefer shade for a bike ride', () => {
    expect(shadeOption(render(true, 7))).toHaveLength(0);
  });
});
