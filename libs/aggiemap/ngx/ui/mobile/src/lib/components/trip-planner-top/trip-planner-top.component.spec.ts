import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { NEVER, of } from 'rxjs';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';
import { DragService } from '@tamu-gisc/ui-kits/ngx/interactions/draggable';

import { TripPlannerTopComponent } from './trip-planner-top.component';

/**
 * The phone's trip planner is offered on a development host and the maintenance message everywhere else, as the
 * desktop sidebar's is (#683, #1722).
 */
describe('TripPlannerTopComponent', () => {
  function render(isTesting: boolean): HTMLElement {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
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

  it('offers the from and to boxes and the travel modes on a development host', () => {
    const element = render(true);

    expect(element.querySelectorAll('.points input').length).toBe(2);
    expect(element.querySelector('tamu-gisc-trip-planner-mode-picker-mobile')).not.toBeNull();
    expect(element.querySelector('.maintenance-message')).toBeNull();
  });

  it('shows the maintenance message, and none of the planner, elsewhere', () => {
    const element = render(false);

    expect(element.querySelector('.maintenance-message')?.textContent).toContain('undergoing maintenance');
    expect(element.querySelector('.points input')).toBeNull();
    expect(element.querySelector('tamu-gisc-trip-planner-mode-picker-mobile')).toBeNull();
  });
});
