import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { TripPlannerService } from '../../../../services/trip-planner.service';
import { TripPlannerModeToggleComponent } from './base.component';

/**
 * A greyed-out travel-mode toggle is disabled in fact, not only in appearance (#2586).
 *
 * The toggle is a `div role="button"`, so it has no `disabled` attribute to fall back on. It was greyed, with the
 * `not-allowed` cursor, when the travel options exclude its mode (with Accessible Friendly Directions on, Biking and the
 * bus) or when results came back with none for it, while its click, Enter and Space handlers stayed live and it stayed
 * in the tab order.
 */
describe('TripPlannerModeToggleComponent', () => {
  let fixture: ComponentFixture<TripPlannerModeToggleComponent>;
  let calculateTravelMode: ReturnType<typeof vi.fn>;
  let results: BehaviorSubject<unknown[]>;

  // A trip result for a planner mode, as the service holds one once it has been solved.
  const solved = (mode: number) => ({ isFulfilled: true, isError: false, isProcessing: false, params: { travelMode: { id: `${mode}` } } });

  /**
   * A toggle for `activeModes`, with `qualifying` the modes the current travel options allow, and the results back for
   * `resultModes` (none: nothing has been asked yet).
   */
  function render(activeModes: number[], qualifying: number[], resultModes: number[]) {
    calculateTravelMode = vi.fn().mockReturnValue(activeModes[0]);
    results = new BehaviorSubject(resultModes.map(solved));

    TestBed.configureTestingModule({
      imports: [TripPlannerModeToggleComponent],
      providers: [
        {
          provide: TripPlannerService,
          useValue: {
            TravelOptions: new BehaviorSubject({ travel_mode: 1 }),
            Result: results,
            calculateTravelMode,
            getQualifyingTravelModes: () => qualifying
          }
        }
      ]
    });

    fixture = TestBed.createComponent(TripPlannerModeToggleComponent);
    fixture.componentRef.setInput('activeModes', activeModes);
    fixture.componentRef.setInput('iconName', 'directions_bike');
    fixture.componentRef.setInput('name', 'Biking');
    fixture.componentRef.setInput('label', 'Routing Mode: Biking');
    fixture.detectChanges();
    calculateTravelMode.mockClear();

    return fixture.nativeElement.querySelector('[role="button"]') as HTMLElement;
  }

  const press = (button: HTMLElement) => {
    button.click();
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
  };

  it('is disabled in fact when the travel options exclude its mode (Biking with accessible directions)', () => {
    // Walking (1) was solved; the options allow walking and accessible walking only.
    const button = render([7], [1, 2], [1]);

    expect(button.classList.contains('disabled')).toBe(true);
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.getAttribute('tabindex')).toBe('-1');

    press(button);

    expect(calculateTravelMode).not.toHaveBeenCalledWith(expect.anything(), true);
  });

  it('is disabled in fact when results came back with none for it', () => {
    // Its mode qualifies, but the results that came back have none for it.
    const button = render([7], [1, 7], [1]);

    expect(button.classList.contains('disabled')).toBe(true);
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.getAttribute('tabindex')).toBe('-1');

    press(button);

    expect(calculateTravelMode).not.toHaveBeenCalledWith(expect.anything(), true);
  });

  it('leaves a toggle with a result live: reachable, and a click, Enter or Space chooses it', () => {
    const button = render([7], [1, 7], [1, 7]);

    expect(button.classList.contains('disabled')).toBe(false);
    expect(button.hasAttribute('aria-disabled')).toBe(false);
    expect(button.getAttribute('tabindex')).toBe('0');

    press(button);

    expect(calculateTravelMode).toHaveBeenCalledTimes(3);
    expect(calculateTravelMode).toHaveBeenCalledWith([7], true);
  });

  it('leaves every toggle live before a trip is asked for', () => {
    const button = render([7], [1, 7], []);

    expect(button.classList.contains('disabled')).toBe(false);
    expect(button.getAttribute('tabindex')).toBe('0');

    button.click();

    expect(calculateTravelMode).toHaveBeenCalledWith([7], true);
  });

  it('becomes live again when a result for it arrives', () => {
    const button = render([7], [1, 7], [1]);
    expect(button.getAttribute('aria-disabled')).toBe('true');

    results.next([solved(1), solved(7)]);
    fixture.detectChanges();

    expect(button.hasAttribute('aria-disabled')).toBe(false);
    expect(button.getAttribute('tabindex')).toBe('0');

    button.click();

    expect(calculateTravelMode).toHaveBeenCalledWith([7], true);
  });
});
