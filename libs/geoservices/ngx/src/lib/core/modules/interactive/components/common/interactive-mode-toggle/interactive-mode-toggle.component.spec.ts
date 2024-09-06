import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { InteractiveModeToggleComponent } from './interactive-mode-toggle.component';

import { ComponentMode } from '../base-interactive-geoprocessing/base-interactive-geoprocessing.component';

describe('InteractiveModeToggleComponent', () => {
  let component: InteractiveModeToggleComponent;
  let fixture: ComponentFixture<InteractiveModeToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InteractiveModeToggleComponent]
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

  it('should emit modeChange event when toggleMode is called', () => {
    jest.spyOn(component.modeChange, 'emit');
    component.toggleMode();
    expect(component.modeChange.emit).toHaveBeenCalledWith(null);
  });

  it('should render the mode value', () => {
    component.mode = ComponentMode.Basic;

    fixture.detectChanges();
    const modeElement = fixture.debugElement.query(By.css('.mode-toggle'));
    expect(modeElement.nativeElement.textContent.trim()).toBe('Basic');
  });
});
