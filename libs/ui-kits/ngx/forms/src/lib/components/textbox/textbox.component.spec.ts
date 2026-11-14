import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { TextboxComponent } from './textbox.component';

/**
 * #2963. A clear (x) option on the shared textbox, off unless asked for, so the GIS Day search boxes share one
 * rather than each carrying its own copy, and every other application's textbox is left as it was.
 */
@Component({
  template: `<tamu-gisc-textbox type="text" placeholder="Search" [formControl]="search" [clearable]="clearable()" [clearLabel]="label()"></tamu-gisc-textbox>`,
  imports: [ReactiveFormsModule, TextboxComponent]
})
class HostComponent {
  public readonly search = new FormControl('', { nonNullable: true });
  public readonly clearable = signal(false);
  public readonly label = signal('Clear');
}

/** A textbox as most applications use it: no clear input at all. */
@Component({
  template: `<tamu-gisc-textbox type="text" placeholder="Name" [formControl]="name"></tamu-gisc-textbox>`,
  imports: [ReactiveFormsModule, TextboxComponent]
})
class PlainHostComponent {
  public readonly name = new FormControl('', { nonNullable: true });
}

describe('TextboxComponent clear option (#2963)', () => {
  function open(clearable: boolean) {
    const fixture = TestBed.createComponent(HostComponent);

    fixture.componentInstance.clearable.set(clearable);
    fixture.detectChanges();

    return fixture;
  }

  const root = (fixture: { nativeElement: unknown }) => fixture.nativeElement as HTMLElement;
  const clearButton = (fixture: { nativeElement: unknown }) => root(fixture).querySelector('tamu-gisc-textbox button') as HTMLButtonElement;

  /** Types into the box, as a visitor would. */
  function type(fixture: ReturnType<typeof open>, text: string) {
    const input = root(fixture).querySelector('tamu-gisc-textbox input') as HTMLInputElement;

    input.value = text;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  it('is off unless asked for: a textbox that does not set it has no button, with or without text', () => {
    const fixture = TestBed.createComponent(PlainHostComponent);
    fixture.detectChanges();

    fixture.componentInstance.name.setValue('Texas');
    fixture.detectChanges();

    expect(root(fixture).querySelector('tamu-gisc-textbox button')).toBeNull();
    expect(root(fixture).querySelector('tamu-gisc-textbox .textbox-actions').children).toHaveLength(0);
  });

  it('off, typing adds nothing to the box', () => {
    const fixture = open(false);

    type(fixture, 'texas');

    expect(clearButton(fixture)).toBeNull();
  });

  it('on, shows the button only when there is text', () => {
    const fixture = open(true);
    expect(clearButton(fixture)).toBeNull();

    type(fixture, 'texas');
    expect(clearButton(fixture)).not.toBeNull();

    type(fixture, '');
    expect(clearButton(fixture)).toBeNull();
  });

  it('is a real button with an accessible name, reachable by keyboard and never submitting a form', () => {
    const fixture = open(true);
    fixture.componentInstance.label.set('Clear the search');

    type(fixture, 'texas');
    const button = clearButton(fixture);

    expect(button.tagName).toBe('BUTTON');
    expect(button.type).toBe('button');
    expect(button.getAttribute('aria-label')).toBe('Clear the search');
    expect(button.tabIndex).toBe(0);
  });

  it('clears the text, telling the form as typing does, and puts focus back in the box', async () => {
    const fixture = open(true);
    const changes: Array<string> = [];
    fixture.componentInstance.search.valueChanges.subscribe((v) => changes.push(v));

    type(fixture, 'texas');
    clearButton(fixture).click();
    fixture.detectChanges();
    // ngModel writes the input element a microtask later, as it does for any value the form sets.
    await fixture.whenStable();
    fixture.detectChanges();

    const input = root(fixture).querySelector('tamu-gisc-textbox input') as HTMLInputElement;

    expect(changes).toEqual(['texas', '']);
    expect(fixture.componentInstance.search.value).toBe('');
    expect(input.value).toBe('');
    expect(document.activeElement).toBe(input);
    expect(clearButton(fixture)).toBeNull();
  });

  it('clears a value set by the form, such as a search a link arrived with', () => {
    const fixture = open(true);

    fixture.componentInstance.search.setValue('lower colorado');
    fixture.detectChanges();
    clearButton(fixture).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.search.value).toBe('');
  });

  it('shows no button while the box is disabled', () => {
    const fixture = open(true);

    fixture.componentInstance.search.setValue('texas');
    fixture.componentInstance.search.disable();
    fixture.detectChanges();

    expect(clearButton(fixture)).toBeNull();
  });
});
