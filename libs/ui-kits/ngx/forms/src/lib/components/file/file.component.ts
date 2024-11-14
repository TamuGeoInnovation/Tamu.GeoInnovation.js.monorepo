import { Component, forwardRef, Input, Output, EventEmitter } from '@angular/core';
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
  ]
})
export class FileComponent implements ControlValueAccessor {
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('value')
  private _value = null;

  /**
   * File formats to accept. Default is all.
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept#unique_file_type_specifiers
   */
  @Input()
  public accept = '*';

  /**
   * Reset CTA action text, displayed after a file has been selected.
   */
  @Input()
  public clearMessage = 'Clear';

  @Output()
  public fileSelected: EventEmitter<File> = new EventEmitter();

  public fileName: string;

  public dataType: string;

  public fileExtension: string;

  public get checked() {
    return this._value;
  }

  public set value(c) {
    this._value = c;
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
      this.fileExtension = file.name.split('.').length > 0 ? file.name.split('.').pop().toLowerCase() : 'unkown';

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

  public writeValue(val) {
    this.value = val;
  }

  public setDisabledState(disabled?: boolean) {
    this.value = disabled;
  }

  public reset() {
    this.value = null;
    this.fileName = undefined;
    this.dataType = undefined;
    this.fileExtension = undefined;
    this.fileSelected.next(undefined);
  }
}
