import { Component, forwardRef, ChangeDetectionStrategy, input, model, output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'tamu-gisc-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class FileComponent implements ControlValueAccessor {
  // A model rather than an input: the component sets it itself, from the user and the forms API.
  // eslint-disable-next-line @angular-eslint/no-input-rename
  protected readonly _value = model<File | boolean | null>(null, { alias: 'value' });

  /**
   * File formats to accept. Default is all.
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept#unique_file_type_specifiers
   */
  public readonly accept = input('*');

  /**
   * Reset CTA action text, displayed after a file has been selected.
   */
  public readonly clearMessage = input('Clear');

  // undefined on reset (#3495).
  public readonly fileSelected = output<File | undefined>();

  public fileName: string | undefined;

  public dataType: string | undefined;

  public fileExtension: string | undefined;

  public get checked() {
    return this._value();
  }

  public set value(c) {
    this._value.set(c);
    this._onChange(c);
    this._onTouch();
  }

  public handleFileChange(event) {
    if (event.target.files && event.target.files.length) {
      const [file]: [File] = event.target.files;

      // Pull the name for the file
      this.fileName = file.name;

      // Pull the data type for the file
      this.dataType = file.type;

      // Pull the file extension from the file.
      this.fileExtension = file.name.split('.').pop()?.toLowerCase() ?? 'unkown';

      this.value = file;

      this.fileSelected.emit(file);

      // Immediately clear the input value to prepare for the next file selection. This is important when the file input is cleared and the same file is selected again.
      event.target.value = '';
    }
  }

  private _onChange = (v) => {
    return v;
  };
  private _onTouch = () => {
    return;
  };

  public registerOnChange(fn) {
    this._onChange = fn;
  }

  public registerOnTouched(fn) {
    this._onTouch = fn;
  }

  /**
   * Takes a value from the form without reporting it back as a change or a touch: a form loaded with a record would
   * otherwise count as changed the moment it opened (#2964).
   */
  public writeValue(val) {
    this._value.set(val);
  }

  /**
   * The picker has no disabled look. Disabling it is not a change of file: this used to put the disabled flag in as
   * the value and report that to the form as the user's choice (#2964).
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public setDisabledState(disabled?: boolean) {
    return;
  }

  public reset() {
    this.value = null;
    this.fileName = undefined;
    this.dataType = undefined;
    this.fileExtension = undefined;
    this.fileSelected.emit(undefined);
  }
}
