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

  it('should correctly evaluate setDisabledState', () => {
    component.setDisabledState(true);
    expect(component.disabled()).toBeTruthy();
  });
});
