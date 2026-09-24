import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileComponent } from './file.component';

describe('FileComponent', () => {
  let component: FileComponent;
  let fixture: ComponentFixture<FileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FileComponent]
    }).compileComponents();
  }));

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
  it('should correctly evaluate setDisabledState', () => {
    component.setDisabledState(true);
    expect(component.checked).toBeTruthy();
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
