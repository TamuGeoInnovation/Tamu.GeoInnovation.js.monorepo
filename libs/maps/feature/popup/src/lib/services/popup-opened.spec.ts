import { TestBed } from '@angular/core/testing';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { PopupService } from './popup.service';

/**
 * `opened` fires for a popup the user opened, and not otherwise (#1244).
 *
 * The guard that matters here is the first test. `show` is a `BehaviorSubject` seeded `true`, so
 * anything reacting to it acts once on load, before a feature has been clicked - which for the
 * sidebar-revealing directive would mean every map opening its panel on load. `opened` must have no
 * initial value.
 */

const build = () =>
  TestBed.resetTestingModule()
    .configureTestingModule({
      providers: [{ provide: EnvironmentService, useValue: { value: () => undefined } }]
    })
    .runInInjectionContext(() => new PopupService());

describe('PopupService.opened', () => {
  it('does not fire on subscription, unlike show', () => {
    const service = build();
    const fired: number[] = [];
    const shown: boolean[] = [];

    service.opened.subscribe(() => fired.push(1));
    service.show.subscribe((value) => shown.push(value));

    expect(fired).toEqual([]);
    // Demonstrating the trap this exists to avoid.
    expect(shown).toEqual([true]);
  });

  it('fires when a popup is shown', () => {
    const service = build();
    const fired: number[] = [];
    service.opened.subscribe(() => fired.push(1));

    service.showPopup();

    expect(fired).toEqual([1]);
  });

  it('fires again for each subsequent popup', () => {
    const service = build();
    const fired: number[] = [];
    service.opened.subscribe(() => fired.push(1));

    service.showPopup();
    service.hidePopup();
    service.showPopup();

    expect(fired).toEqual([1, 1]);
  });

  it('does not fire when a popup is hidden', () => {
    const service = build();
    const fired: number[] = [];
    service.opened.subscribe(() => fired.push(1));

    service.hidePopup();

    expect(fired).toEqual([]);
  });
});
