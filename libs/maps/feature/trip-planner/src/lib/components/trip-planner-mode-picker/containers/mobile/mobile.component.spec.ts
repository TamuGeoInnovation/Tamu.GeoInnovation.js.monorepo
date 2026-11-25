import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { TripPlannerService } from '../../../../services/trip-planner.service';
import { TripPlannerModePickerMobileComponent } from './mobile.component';

/**
 * The phone's mode picker offers the accessible (ADA) toggle only where development-only features are on (#2801, #3468).
 *
 * Accessible routing is development-only because the routing network does not route accessible trips (#2592). The
 * desktop picker gated its Options link; the phone's picker, a separate template, offered the toggle on production.
 */
describe('TripPlannerModePickerMobileComponent', () => {
  function render(isTesting: boolean): HTMLElement {
    TestBed.configureTestingModule({
      imports: [TripPlannerModePickerMobileComponent],
      providers: [
        { provide: TestingService, useValue: { get: () => of(isTesting) } },
        {
          provide: TripPlannerService,
          // Walking, a mode whose rule has an accessible version, so the toggle would be live.
          useValue: { TravelOptions: new BehaviorSubject({ travel_mode: 1, accessible: false }), verifyRuleAccessibility: () => true }
        }
      ]
    });

    // The travel-mode toggles are not what is tested, and need the planner's services.
    TestBed.overrideComponent(TripPlannerModePickerMobileComponent, {
      set: { imports: [NgClass, AsyncPipe], schemas: [CUSTOM_ELEMENTS_SCHEMA] }
    });

    const fixture = TestBed.createComponent(TripPlannerModePickerMobileComponent);

    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  it('does not offer the accessible toggle where development-only features are off', () => {
    expect(render(false).querySelector('#direction-accessible-mode')).toBeNull();
  });

  it('offers the accessible toggle where development-only features are on', () => {
    expect(render(true).querySelector('#direction-accessible-mode')).not.toBeNull();
  });
});
