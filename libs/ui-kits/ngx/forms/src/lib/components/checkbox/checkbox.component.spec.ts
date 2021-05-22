import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxComponent } from './checkbox.component';

describe('CheckboxComponent', () => {
  let component: CheckboxComponent;
  let fixture: ComponentFixture<CheckboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CheckboxComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should respond to mouse events', (done) => {
    component.changed.subscribe((event) => {
      expect(event).toEqual(true);
      done();
    });
    component.handleMouseEvent();
  });

  it('should respond to keyboard events', (done) => {
    component.changed.subscribe((event) => {
      expect(event).toEqual(true);
      done();
    });
    component.handleKeyboardEvent();
  });
  it('should correctly evaluate setDisabledState', () => {
    component.setDisabledState(true);
    expect(component.disabled).toEqual(true);
  });

  it('should correctly evaluate _setValueNoEmit', () => {
    component._setValueNoEmit(true);
    expect(component.checked).toEqual(true);
  });
});
