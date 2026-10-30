import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';

import { TripPlannerService } from '../../../../services/trip-planner.service';
import { TripPlannerModeToggleComponent } from './base.component';

/**
 * A mode the planner will not solve (#2580) is drawn, and disabled in fact: styling alone is a live button in costume.
 */
describe('TripPlannerModeToggleComponent', () => {
  let fixture: ComponentFixture<TripPlannerModeToggleComponent>;
  let calculateTravelMode: ReturnType<typeof vi.fn>;

  function render(name: string, activeModes: number[]) {
    calculateTravelMode = vi.fn().mockReturnValue(activeModes[0]);

    TestBed.configureTestingModule({
      imports: [TripPlannerModeToggleComponent],
      providers: [
        {
          provide: TripPlannerService,
          useValue: {
            TravelOptions: new BehaviorSubject({ travel_mode: 1 }),
            Result: of([]),
            calculateTravelMode,
            getQualifyingTravelModes: () => [1, 2, 7]
          }
        }
      ]
    });

    fixture = TestBed.createComponent(TripPlannerModeToggleComponent);
    fixture.componentRef.setInput('activeModes', activeModes);
    fixture.componentRef.setInput('iconName', 'directions_car');
    fixture.componentRef.setInput('name', name);
    fixture.componentRef.setInput('label', `Routing Mode: ${name}`);
    fixture.detectChanges();
    calculateTravelMode.mockClear();

    return fixture.nativeElement.querySelector('[role="button"]') as HTMLElement;
  }

  it('draws a disabled button for driving, which cannot be reached or chosen', () => {
    const button = render('Driving', [3, 4, 8]);

    expect(button).not.toBeNull();
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.getAttribute('tabindex')).toBe('-1');
    expect(button.classList.contains('disabled')).toBe(true);
    expect(button.getAttribute('title')).toBe('Driving directions are not available yet');
    expect(button.getAttribute('aria-label')).toContain('not available yet');

    button.click();
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));

    expect(calculateTravelMode).not.toHaveBeenCalledWith(expect.anything(), true);
  });

  it('draws the bus disabled too', () => {
    const button = render('Bus', [5, 6]);

    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.getAttribute('title')).toBe('Bus directions are not available yet');
  });

  it('leaves walking live: reachable, and a click chooses it', () => {
    const button = render('Walking', [1, 2]);

    expect(button.hasAttribute('aria-disabled')).toBe(false);
    expect(button.getAttribute('tabindex')).toBe('0');
    expect(button.getAttribute('title')).toBe('Walking');

    button.click();

    expect(calculateTravelMode).toHaveBeenCalledWith([1, 2], true);
  });
});
