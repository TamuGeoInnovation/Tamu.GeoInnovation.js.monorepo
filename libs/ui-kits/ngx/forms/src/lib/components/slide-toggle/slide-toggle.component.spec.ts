import { Component, ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { SlideToggleComponent } from './slide-toggle.component';

interface Option {
  value: string;
  label: string;
}

@Component({
  template: `<tamu-gisc-slide-toggle
    [options]="options"
    [displayPath]="'label'"
    [valuePath]="'value'"
    [ngModel]="value"
  ></tamu-gisc-slide-toggle>`,
  imports: [SlideToggleComponent, FormsModule]
})
class HostComponent {
  public options: Option[] = [
    { value: 'basic', label: 'Basic' },
    { value: 'advanced', label: 'Advanced' }
  ];
  public value: string | undefined = undefined;
}

describe('SlideToggleComponent', () => {
  /**
   * A toggle given no value yet - geoservices' mode toggle before its mode is set - matched no option, and measured
   * `undefined` a tick later: "Cannot read properties of undefined (reading 'nativeElement')". Jest let an error thrown
   * after a test end unreported; Vitest fails the run on it (#1479).
   */
  it('renders with no value without an error', async () => {
    const errors: unknown[] = [];
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: ErrorHandler, useValue: { handleError: (e: unknown) => errors.push(e) } }]
    });

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 20));
    fixture.detectChanges();

    expect(errors).toEqual([]);
  });

  it('still measures the option that matches its value', async () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });

    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.value = 'advanced';
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 20));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.toggle-highlighter')).not.toBeNull();
  });
});
