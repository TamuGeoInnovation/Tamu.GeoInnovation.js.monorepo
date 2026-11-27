import { Component, provideZonelessChangeDetection, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { FileComponent } from './file.component';

describe('FileComponent', () => {
  let component: FileComponent;
  let fixture: ComponentFixture<FileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should correctly evaluate checked', () => {
    expect(component.checked).toBeFalsy();
  });
  it('should correctly evaluate writeValue', () => {
    component.writeValue(true);
    expect(component.checked).toBeTruthy();
  });
  // #2964: disabling the picker is not a choice of file. It used to put `true` in as the value and tell the form.
  it('leaves the value alone when the form disables it, and tells the form nothing', () => {
    const onChange = vi.fn();
    component.registerOnChange(onChange);

    component.setDisabledState(true);

    expect(component.checked).toBeFalsy();
    expect(onChange).not.toHaveBeenCalled();
  });

  /**
   * `handleFileChange` no longer uses FileReader -- the previous assertion spied on
   * `FileReader.prototype.readAsDataURL`, which the component stopped calling. It now reads the
   * file's metadata, stores the file as the control value, emits `fileSelected`, and clears the
   * input so the same file can be picked again. Assert that instead.
   */
  it('should handleFileChange()', () => {
    const mockFile = new File(['go'], 'go.text', { type: 'text/plain' });
    const mockEvt = { target: { files: [mockFile], value: 'go.text' } };

    const emitted: Array<File> = [];
    component.fileSelected.subscribe((f: File) => emitted.push(f));

    component.handleFileChange(mockEvt);

    expect(component.fileName).toEqual('go.text');
    expect(component.dataType).toEqual('text/plain');
    expect(component.fileExtension).toEqual('text');
    // The component defines a `value` setter but names its getter `checked`, so `value`
    // is write-only. The stored file is therefore read back through `checked`.
    expect(component.checked).toBe(mockFile);
    expect(emitted).toEqual([mockFile]);
    expect(mockEvt.target.value).toEqual('');
  });
});

// #1478, g121: GIS Day runs zoneless, and the picker is Eager, so it is redrawn only when something tells Angular to.
// `reset()` clears plain fields the template reads, so called from a callback that tells Angular nothing - an upload's
// response, a timer - it left the chosen file's name on screen.
describe('FileComponent, zoneless', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [FileComponent], providers: [provideZonelessChangeDetection()] });
  });

  it('clears the shown file name when reset() is called from a timer', async () => {
    const fixture = TestBed.createComponent(FileComponent);
    fixture.autoDetectChanges(true);
    await fixture.whenStable();

    fixture.componentInstance.handleFileChange({ target: { files: [new File(['x'], 'poster.pdf')], value: '' } });
    fixture.componentRef.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('poster.pdf');

    await new Promise<void>((done) =>
      setTimeout(() => {
        fixture.componentInstance.reset();
        done();
      })
    );
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).not.toContain('poster.pdf');
  });
});

@Component({
  imports: [FileComponent, ReactiveFormsModule],
  template: `<form [formGroup]="form"><tamu-gisc-file formControlName="file">Choose a file</tamu-gisc-file></form>`
})
class FormHost {
  public readonly form = new FormGroup({ file: new FormControl<File | null>(null) });
  public readonly picker = viewChild.required(FileComponent);
}

// A form that resets after a file was chosen, as one does once it is submitted, left the old file's name and its Clear
// link on screen, though the form's value was empty (#3680).
describe('FileComponent in a form that resets (#3680)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [FormHost], providers: [provideZonelessChangeDetection()] });
  });

  it('shows no file name and no Clear link after form.reset()', async () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.autoDetectChanges(true);
    await fixture.whenStable();

    fixture.componentInstance.picker().handleFileChange({ target: { files: [new File(['x'], 'poster.pdf')], value: '' } });
    fixture.componentInstance.picker()['_changes'].markForCheck();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('poster.pdf');

    fixture.componentInstance.form.reset();
    await fixture.whenStable();

    expect(fixture.componentInstance.form.value.file).toBeNull();
    expect(fixture.componentInstance.picker().fileName).toBeUndefined();
    expect(fixture.nativeElement.textContent).not.toContain('poster.pdf');
    expect(fixture.nativeElement.textContent).not.toContain('Clear');
    expect(fixture.nativeElement.textContent).toContain('Choose a file');
  });

  it('still shows the name of a file the form is given', async () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.autoDetectChanges(true);
    await fixture.whenStable();

    fixture.componentInstance.picker().handleFileChange({ target: { files: [new File(['x'], 'slides.pptx')], value: '' } });
    fixture.componentInstance.picker()['_changes'].markForCheck();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('slides.pptx');
  });
});
