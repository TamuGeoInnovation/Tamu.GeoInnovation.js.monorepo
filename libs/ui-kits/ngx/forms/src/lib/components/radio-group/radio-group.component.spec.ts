import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioGroupComponent } from './radio-group.component';

describe('RadioGroupComponent', () => {
  let component: RadioGroupComponent<{ test: number }, number>;
  let fixture: ComponentFixture<RadioGroupComponent<{ test: number }, number>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RadioGroupComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent<RadioGroupComponent<{ test: 2 }, number>>(RadioGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly evaluate writeValue ', () => {
    component.writeValue(3);
    expect(component.value).toBe(3);
  });

  it('should correctly evaluate setDisabledState', () => {
    component.setDisabledState(false);
    expect(component.disabled).toBe(false);
  });

  it('should correctly evaluate evaluateSetValue with a valid valuePath', () => {
    component.valuePath = 'test';
    component.setDisabledState(false);
    component.evaluateSetValue({ test: 1 });
    expect(component.value).toBe(1);
  });

  it('should correctly evaluate evaluateSetValue with an invalid valuePath', () => {
    component.valuePath = 'tesssss';
    component.setDisabledState(true);
    component.evaluateSetValue({ test: 1 });
    expect(component.value).toBe(undefined);
  });
});
