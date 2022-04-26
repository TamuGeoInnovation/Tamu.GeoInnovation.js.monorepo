import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AbstractValueAccessorFormComponent } from './abstract-value-accessor-form.component';

describe('AbstractValueAccessorFormComponent', () => {
  let component: AbstractValueAccessorFormComponent<boolean>;
  let fixture: ComponentFixture<AbstractValueAccessorFormComponent<boolean>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AbstractValueAccessorFormComponent]
    }).compileComponents();
  }));

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
  it('should correctly evaluate setDisabledState', () => {
    component.setDisabledState(true);
    expect(component.disabled).toBeTruthy();
  });
});
