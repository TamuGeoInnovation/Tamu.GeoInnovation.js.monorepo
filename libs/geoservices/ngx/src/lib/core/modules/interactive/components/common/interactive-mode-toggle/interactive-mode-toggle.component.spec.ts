import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { InteractiveModeToggleComponent } from './interactive-mode-toggle.component';

import {
  ComponentMode,
  ComponentModeLabel
} from '../base-interactive-geoprocessing/base-interactive-geoprocessing.component';

describe('InteractiveModeToggleComponent', () => {
  let component: InteractiveModeToggleComponent;
  let fixture: ComponentFixture<InteractiveModeToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InteractiveModeToggleComponent],
      // The template renders <tamu-gisc-slide-toggle>, which is not declared here. Schema-only so
      // the unknown element does not fail compilation -- this spec covers the toggle's own logic,
      // not the child component's rendering.
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractiveModeToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * `toggleMode` takes the newly selected mode and emits only when it differs from the current one.
   * The previous spec called it with no argument and expected an emit of `null`, which matched an
   * earlier signature -- with the current guard, `undefined` emits nothing.
   */
  it('emits modeChange when a different mode is selected', () => {
    component.mode = ComponentMode.Basic;
    const spy = jest.spyOn(component.modeChange, 'emit');

    component.toggleMode(ComponentMode.Advanced);

    expect(spy).toHaveBeenCalledWith(ComponentMode.Advanced);
  });

  it('does not emit when the selected mode is unchanged', () => {
    component.mode = ComponentMode.Basic;
    const spy = jest.spyOn(component.modeChange, 'emit');

    component.toggleMode(ComponentMode.Basic);

    expect(spy).not.toHaveBeenCalled();
  });

  /**
   * The previous spec queried a `.mode-toggle` element that the template does not contain -- the
   * label text is rendered by the child slide-toggle. Assert the options this component supplies.
   */
  it('offers both modes with their labels', () => {
    expect(component.options).toEqual([
      { value: ComponentMode.Basic, label: ComponentModeLabel.Basic },
      { value: ComponentMode.Advanced, label: ComponentModeLabel.Advanced }
    ]);
  });
});
