import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { SelectComponent } from './select.component';

describe('SelectComponent', () => {
  let component: SelectComponent<{ test: 'value' }>;
  let fixture: ComponentFixture<SelectComponent<{ test: 'value' }>>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, SelectComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent<SelectComponent<{ test: 'value' }>>(SelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should respond to keyboard events', () =>
    new Promise<void>((done) => {
      component.changed.subscribe((event) => {
        expect(event).toEqual({ test: 'value' });
        done();
      });

      component.value = { test: 'value' };
      component.changeEvent();
    }));

  it('getDataItemValue should handle template being undefined', () => {
    expect(component.getDataItemValue({ test: 'value' })).toEqual({ test: 'value' });
  });
  it('getDataItemValue should handle correct inputs', () => {
    expect(component.getDataItemValue({ test: 'value' }, 'test')).toEqual('value');
  });

  it('should correctly evaluate setDisabledState', () => {
    component.setDisabledState(true);
    expect(component.disabled()).toBeTruthy();
  });
});

/**
 * #2656. A searchable select narrows its options by typed text and is still a drop-down: the GIS Day speaker form's
 * University and Organization, each a long list.
 */
describe('SelectComponent, searchable', () => {
  interface Place {
    guid: string;
    name: string;
  }

  const places: Array<Place> = [
    { guid: 'a', name: 'University of Alabama' },
    { guid: 'b', name: 'Texas A&M University' },
    { guid: 'c', name: 'University of Texas at Austin' }
  ];

  let fixture: ComponentFixture<SelectComponent<Place>>;
  let component: SelectComponent<Place>;
  let changes: Array<unknown>;

  function type(text: string) {
    component.search.setValue(text);
    fixture.detectChanges();
  }

  function leaveTo(next: Node | null) {
    component.leave({ relatedTarget: next } as unknown as FocusEvent);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SelectComponent] }).compileComponents();

    fixture = TestBed.createComponent<SelectComponent<Place>>(SelectComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('searchable', true);
    fixture.componentRef.setInput('data', places);
    fixture.componentRef.setInput('displayTemplate', 'name');
    fixture.componentRef.setInput('valueTemplate', 'guid');
    fixture.componentRef.setInput('placeholder', 'Select University');

    changes = [];
    component.registerOnChange((value: unknown) => changes.push(value));
    fixture.detectChanges();
  });

  it('draws the shared autocomplete instead of a native select', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('tamu-gisc-autocomplete')).toBeTruthy();
    expect(element.querySelector('select')).toBeNull();
  });

  it('offers every option while nothing is typed, so it works as a drop-down', () => {
    expect(component.matches().map((p) => p.guid)).toEqual(['a', 'b', 'c']);
  });

  it('narrows the options to those containing the typed text, ignoring case', () => {
    type('texas');
    expect(component.matches().map((p) => p.guid)).toEqual(['b', 'c']);

    type('ALAB');
    expect(component.matches().map((p) => p.guid)).toEqual(['a']);

    type('nowhere');
    expect(component.matches()).toEqual([]);
  });

  it("sets the form's value to the chosen option's valueTemplate property and shows its label", () => {
    component.choose(places[1]);
    fixture.detectChanges();

    expect(changes).toEqual(['b']);
    expect(component.value).toBe('b');
    expect(component.search.value).toBe('Texas A&M University');
  });

  it('shows the label of a value the form writes, even one written before the options arrive', () => {
    fixture.componentRef.setInput('data', undefined);
    component.writeValue('c');
    fixture.detectChanges();
    expect(component.search.value).toBe('');

    fixture.componentRef.setInput('data', places);
    fixture.detectChanges();
    expect(component.search.value).toBe('University of Texas at Austin');
  });

  it('offers every option again while the text is still the chosen label', () => {
    component.writeValue('a');
    fixture.detectChanges();

    expect(component.matches().map((p) => p.guid)).toEqual(['a', 'b', 'c']);
  });

  it("puts back the chosen label when focus leaves with text that is not an option's", () => {
    component.writeValue('a');
    fixture.detectChanges();
    type('Univ');
    leaveTo(null);

    expect(component.search.value).toBe('University of Alabama');
    expect(component.value).toBe('a');
  });

  it('chooses an option whose whole label was typed, and clears the value when the text is emptied', () => {
    type('texas a&m university');
    leaveTo(null);
    expect(component.value).toBe('b');

    type('');
    leaveTo(null);
    expect(component.value).toBeUndefined();
    expect(changes).toEqual(['b', undefined]);
  });

  it('does nothing while focus only moves inside it, as to an option in the list', () => {
    type('Univ');
    leaveTo(fixture.nativeElement.querySelector('input'));

    expect(component.search.value).toBe('Univ');
    expect(changes).toEqual([]);
  });

  it('disables the text field with the form', () => {
    component.setDisabledState(true);
    fixture.detectChanges();

    expect(component.search.disabled).toBe(true);
  });
});
