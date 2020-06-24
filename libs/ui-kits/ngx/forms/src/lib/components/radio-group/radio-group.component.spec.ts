import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Angulartics2Module } from 'angulartics2';

import { RadioGroupComponent } from './radio-group.component';

describe('RadioGroupComponent', () => {
  let component: RadioGroupComponent<{}, {}>;
  let fixture: ComponentFixture<RadioGroupComponent<{}, {}>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RadioGroupComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RadioGroupComponent);
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

  it('should correctly evaluate evaluateSetValue', () => {
    component.setDisabledState(false);
    component.evaluateSetValue('yeet');
    expect(component.value).toBe(undefined);
    component.setDisabledState(true);
    component.evaluateSetValue('yeet');
    expect(component.value).toBe(undefined);
  });
});
