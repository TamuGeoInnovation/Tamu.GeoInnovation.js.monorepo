import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TestBed, ComponentFixture } from '@angular/core/testing';

import { ActivateDirective } from './activate.directive';

@Component({
  template: `<div class="button" (tamuGiscActivate)="activations = activations + 1">Go</div>`,
  imports: [ActivateDirective]
})
class HostComponent {
  public activations = 0;
}

describe('ActivateDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    host = fixture.debugElement.query(By.directive(ActivateDirective)).nativeElement;
  });

  const key = (name: string) => {
    const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true });
    host.dispatchEvent(event);
    fixture.detectChanges();
    return event;
  };

  it('is a focusable button for assistive technology', () => {
    expect(host.getAttribute('role')).toBe('button');
    expect(host.getAttribute('tabindex')).toBe('0');
  });

  it('activates on click', () => {
    host.click();

    expect(fixture.componentInstance.activations).toBe(1);
  });

  it('activates on Enter', () => {
    key('Enter');

    expect(fixture.componentInstance.activations).toBe(1);
  });

  it('activates on Space, and stops the page scrolling', () => {
    const event = key(' ');

    expect(fixture.componentInstance.activations).toBe(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it('ignores other keys', () => {
    key('a');
    key('Tab');

    expect(fixture.componentInstance.activations).toBe(0);
  });
});
