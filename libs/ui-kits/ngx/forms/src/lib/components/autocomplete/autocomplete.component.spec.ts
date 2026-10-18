import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { ReplaySubject } from 'rxjs';

import { AutocompleteComponent } from './autocomplete.component';

interface Item {
  name: string;
}

@Component({
  template: `<tamu-gisc-autocomplete [control]="control" [options]="options" (optionSelected)="selected = $event"></tamu-gisc-autocomplete>`,
  imports: [AutocompleteComponent]
})
class HostComponent {
  public control = new FormControl('');
  public options = new ReplaySubject<Item[]>(1);
  public selected: Item | undefined;
}

/**
 * What a browser does when an element is pressed with the mouse: focus moves to the nearest focusable
 * ancestor of what was pressed, or leaves the page's focused element if there is none, and only then,
 * on release, does the click arrive - on whatever is still under the pointer.
 */
function pressWithMouse(fixture: ComponentFixture<unknown>, element: HTMLElement): void {
  const focusable = element.closest<HTMLElement>('[tabindex], input, button, a[href]');

  if (focusable) {
    focusable.focus();
  } else {
    (document.activeElement as HTMLElement | null)?.blur();
  }

  fixture.detectChanges();

  if (element.isConnected) {
    element.click();
    fixture.detectChanges();
  }
}

describe('AutocompleteComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.nativeElement.remove();
  });

  // #1868: on All Maps, a search result could not be chosen with the mouse. Pressing it took focus out of
  // the input, the list closed on that focus change, and the click that should have chosen the result
  // landed on the page behind it.
  it('chooses an option pressed with the mouse, after results arrive while the list is open', fakeAsync(() => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

    input.focus();
    host.control.setValue('Kick');
    fixture.detectChanges();

    // Results arrive after the list has opened, as All Maps' debounced search does.
    tick(100);
    host.options.next([{ name: 'Kickoff at Kyle' }]);
    fixture.detectChanges();

    const option: HTMLElement = fixture.nativeElement.querySelector('.autocomplete-item');
    expect(option).toBeTruthy();

    pressWithMouse(fixture, option);

    expect(host.selected).toEqual({ name: 'Kickoff at Kyle' });
    expect(fixture.nativeElement.querySelector('.autocomplete-item')).toBeNull();
  }));

  it('closes the list when focus leaves for somewhere outside it', fakeAsync(() => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

    input.focus();
    host.control.setValue('Kick');
    host.options.next([{ name: 'Kickoff at Kyle' }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.autocomplete-item')).toBeTruthy();

    input.blur();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.autocomplete-item')).toBeNull();
    expect(host.selected).toBeUndefined();
  }));
});
