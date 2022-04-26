import { async, TestBed, ComponentFixture } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { SelectComponent } from './select.component';

describe('SelectComponent', () => {
  let component: SelectComponent<{ test: 'value' }>;
  let fixture: ComponentFixture<SelectComponent<{ test: 'value' }>>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [SelectComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent<SelectComponent<{ test: 'value' }>>(SelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should respond to keyboard events', (done) => {
    component.changed.subscribe((event) => {
      expect(event).toEqual({ test: 'value' });
      done();
    });

    component.value = { test: 'value' };
    component.changeEvent();
  });

  it('getDataItemValue should handle template being undefined', () => {
    expect(component.getDataItemValue({ test: 'value' })).toEqual({ test: 'value' });
  });
  it('getDataItemValue should handle correct inputs', () => {
    expect(component.getDataItemValue({ test: 'value' }, 'test')).toEqual('value');
  });

  it('should correctly evaluate setDisabledState', () => {
    component.setDisabledState(true);
    expect(component.disabled).toBeTruthy();
  });
});
