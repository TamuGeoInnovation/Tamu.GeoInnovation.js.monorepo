import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { InteractivePricingComponent } from './interactive-pricing.component';

/**
 * #3597. The pricing page's credit slider is the shared range with its tooltip on (`[showTooltip]="true"`), on a
 * reactive form control. The form wrote its first value before the slider had drawn its tooltip, and the slider
 * threw `Cannot read properties of undefined (reading 'nativeElement')` (#3595): nothing on the page looked wrong, so
 * only the console said so. This renders the real page, moves the slider across every value it offers, and fails on
 * a thrown error or anything written to `console.error`.
 */
describe('InteractivePricingComponent, its credit slider', () => {
  let consoleErrors: Array<unknown[]>;

  beforeEach(() => {
    consoleErrors = [];
    vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      consoleErrors.push(args);
    });

    TestBed.configureTestingModule({
      imports: [InteractivePricingComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} } } },
        { provide: EnvironmentService, useValue: { value: () => 'https://accounts.example.invalid' } }
      ]
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function render() {
    const fixture = TestBed.createComponent(InteractivePricingComponent);
    fixture.detectChanges();

    return fixture;
  }

  it('opens without an error', () => {
    expect(() => render()).not.toThrow();
    expect(consoleErrors).toEqual([]);
  });

  it('moves across every value the slider offers without an error', () => {
    const fixture = render();
    const page = fixture.nativeElement as HTMLElement;
    const slider = page.querySelector<HTMLInputElement>('tamu-gisc-range input[type="range"]');

    expect(slider).not.toBeNull();

    const max = Number(slider?.max ?? 0);
    for (let value = 0; value <= max; value++) {
      fixture.componentInstance.form.get('creditCount')?.setValue(value);
      fixture.detectChanges();
    }

    expect(max).toBeGreaterThan(0);
    expect(consoleErrors).toEqual([]);
  });
});
