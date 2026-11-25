import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TooltipComponent } from './tooltip.component';

describe('TooltipComponent', () => {
  let component: TooltipComponent;
  let fixture: ComponentFixture<TooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create', () => {
    component.isVisible.set(true);
    component.clickOutside(document.dispatchEvent(new Event('mousedown')));
    expect(component.isVisible()).toBeFalsy();
  });

  // #2942: the date-time picker opens in a tooltip. Escape closes it, as it does a drop-down, and is claimed, so an
  // admin details page around it does not also take it as "go back to the list".
  function escape() {
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    document.body.dispatchEvent(event);
    return event;
  }

  it('closes on Escape while open, and claims the Escape', () => {
    component.isVisible.set(true);

    const event = escape();

    expect(component.isVisible()).toBe(false);
    expect(event.defaultPrevented).toBe(true);
  });

  it('leaves Escape alone while closed', () => {
    expect(escape().defaultPrevented).toBe(false);
  });
});

// #1756: the date-time picker opens its 20rem popup in a fixed-position tooltip. At phone width, with the trigger near
// either edge, no spot around it fits whole, and the popup went off the screen's edge, where it could not be used.
describe('TooltipComponent placement (#1756)', () => {
  let component: TooltipComponent;

  type Box = { left: number; top: number; width: number; height: number };
  const place = (trigger: Box, popup: { width: number; height: number }, window: { width: number; height: number }) =>
    (component as unknown as { calculateOffset: (r: Box, e: unknown, b: Box) => { x: number; y: number } }).calculateOffset(
      trigger,
      popup,
      { left: 0, top: 0, ...window }
    );

  // The picker's popup: 20rem wide, an input tall.
  const popup = { width: 320, height: 60 };
  const phone = { width: 390, height: 844 };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TooltipComponent] });
    component = TestBed.createComponent(TooltipComponent).componentInstance;
  });

  it.each([
    ['near the left edge', { left: 16, top: 400, width: 120, height: 24 }],
    ['near the right edge', { left: 254, top: 400, width: 120, height: 24 }],
    ['near the top left', { left: 16, top: 12, width: 120, height: 24 }],
    ['near the bottom left', { left: 16, top: 800, width: 120, height: 24 }],
    ['across the whole width', { left: 16, top: 400, width: 358, height: 24 }]
  ])('keeps the popup wholly inside a 390 px window, with its trigger %s', (_where, trigger) => {
    const { x, y } = place(trigger, popup, phone);

    expect(x).toBeGreaterThanOrEqual(0);
    expect(x + popup.width).toBeLessThanOrEqual(phone.width);
    expect(y).toBeGreaterThanOrEqual(0);
    expect(y + popup.height).toBeLessThanOrEqual(phone.height);
  });

  it('keeps the popup clear of its trigger, above or below it', () => {
    const trigger = { left: 16, top: 400, width: 120, height: 24 };
    const { y } = place(trigger, popup, phone);

    expect(y + popup.height <= trigger.top || y >= trigger.top + trigger.height).toBe(true);
  });

  it('places it where it always has when a spot around the trigger fits: above it, centred', () => {
    expect(place({ left: 600, top: 400, width: 120, height: 24 }, popup, { width: 1280, height: 900 })).toEqual({
      x: 490,
      y: 330
    });
  });
});
