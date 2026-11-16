import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbstractValueAccessorFormComponent } from './abstract-value-accessor-form.component';

describe('AbstractValueAccessorFormComponent', () => {
  let component: AbstractValueAccessorFormComponent<boolean>;
  let fixture: ComponentFixture<AbstractValueAccessorFormComponent<boolean>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbstractValueAccessorFormComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent<AbstractValueAccessorFormComponent<boolean>>(AbstractValueAccessorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should correctly evaluate writeValue', () => {
    component.writeValue(true);
    expect(component.value).toBeTruthy();
    component.writeValue(null);
    expect(component.value).toBeUndefined();
  });
  it('should correctly evaluate registerOnChange', () => {
    component.registerOnChange(component.writeValue(true));
    expect(component.value).toBeTruthy();
  });

  it('should correctly evaluate registerOnTouched', () => {
    component.registerOnTouched(component.writeValue(true));
    expect(component.value).toBeTruthy();
  });
  // #2964: a value the form writes is the form's own, not a change for the control to report back.
  it('takes a value the form writes without reporting it as a change or a touch', () => {
    const onChange = vi.fn();
    const onTouched = vi.fn();
    component.registerOnChange(onChange);
    component.registerOnTouched(onTouched);

    component.writeValue(true);

    expect(component.value).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
    expect(onTouched).not.toHaveBeenCalled();
  });

  it('reports a value the control sets itself, as from the user', () => {
    const onChange = vi.fn();
    const onTouched = vi.fn();
    component.registerOnChange(onChange);
    component.registerOnTouched(onTouched);

    component.value = true;

    expect(onChange).toHaveBeenCalledWith(true);
    expect(onTouched).toHaveBeenCalled();
  });

  // #3007: a field of an object value is set on a new object and reported, leaving the form's own object as it was.
  it('reports a field set on an object value as a change, on a new object', () => {
    const fixture = TestBed.createComponent<AbstractValueAccessorFormComponent<{ label: string; url: string }>>(
      AbstractValueAccessorFormComponent
    );
    const link = fixture.componentInstance;
    const onChange = vi.fn();
    const loaded = { label: 'Volunteer', url: 'https://example.com/volunteer' };
    link.registerOnChange(onChange);
    link.writeValue(loaded);

    link.setInternalProperty('url', 'https://example.com/sponsor');

    expect(onChange).toHaveBeenCalledWith({ label: 'Volunteer', url: 'https://example.com/sponsor' });
    expect(link.value).not.toBe(loaded);
    expect(loaded.url).toBe('https://example.com/volunteer');
  });

  it('should correctly evaluate setDisabledState', () => {
    component.setDisabledState(true);
    expect(component.disabled()).toBeTruthy();
  });
});
