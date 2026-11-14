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
