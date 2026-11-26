import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

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
