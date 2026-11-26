import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { RangeComponent } from './range.component';

@Component({
  template: `<tamu-gisc-range [formControl]="credits" [showTooltip]="true" [max]="10"></tamu-gisc-range>`,
  imports: [ReactiveFormsModule, RangeComponent]
})
class RangeWithTooltipHostComponent {
  public readonly credits = new FormControl(3);
}

/**
 * #3495. A form writes its first value into the slider before the slider's view is drawn, and with `showTooltip` the
 * value setter wrote into the tooltip's `<output>`, which did not exist yet: `Cannot read properties of undefined
 * (reading 'nativeElement')`. Geoservices' pricing slider is one: `[showTooltip]="true"` on a reactive form control.
 */
describe('RangeComponent, its tooltip', () => {
  function render() {
    const fixture = TestBed.createComponent(RangeWithTooltipHostComponent);
    fixture.detectChanges();

    return fixture;
  }

  it('takes the form value it starts with before its tooltip is drawn', () => {
    expect(() => render()).not.toThrow();
  });

  it('shows each value set after that in its tooltip', () => {
    const fixture = render();

    fixture.componentInstance.credits.setValue(7);
    fixture.detectChanges();

    // innerText, as the component writes it: jsdom keeps it as a property rather than as the element's text.
    expect((fixture.nativeElement as HTMLElement).querySelector('output')?.innerText).toBe(7);
  });
});
