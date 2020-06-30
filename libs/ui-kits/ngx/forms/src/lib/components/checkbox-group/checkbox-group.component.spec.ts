import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxGroupComponent } from './checkbox-group.component';
import { QueryList } from '@angular/core';

describe('CheckboxGroupComponent', () => {
  let component: CheckboxGroupComponent;
  let fixture: ComponentFixture<CheckboxGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CheckboxGroupComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxGroupComponent);
    component = fixture.componentInstance;

    // Provide @Input properties
    component.referenceId = 'name';

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly evaluate ngOnInit', () => {
    component.referenceId = undefined;
    expect(() => {
      component.ngOnInit();
    }).toThrow();
  });

  it('should correctly evaluate writeValue', () => {
    component.writeValue(['reeee', 'reeee']);
    expect(component.value).toStrictEqual(['reeee', 'reeee']);
  });
});
