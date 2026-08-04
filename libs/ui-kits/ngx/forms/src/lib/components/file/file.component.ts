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
  private _value: File | null = null;

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
  public fileSelected: EventEmitter<File | null> = new EventEmitter();

  public fileName: string = '';

  public dataType: string = '';

  public fileExtension: string = '';

  public get checked() {
    return this._value;
  }

  public set value(c: File | null) {
    this._value = c;
    this._onChange(c);
    this._onTouch();
  }

  public handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length) {
      const [file]: [File] = target.files as unknown as [File];

      // Pull the name for the file
      this.fileName = file.name;

      // Pull the data type for the file
      this.dataType = file.type;

      // Pull the file extension from the file.
      const splits = file.name.split('.');
      this.fileExtension = splits.length > 0 ? (splits.pop() ?? 'unknown').toLowerCase() : 'unknown';

      this.value = file;

      this.fileSelected.emit(file);

      // Immediately clear the input value to prepare for the next file selection. This is important when the file input is cleared and the same file is selected again.
      target.value = '';
    }
  }

  private _onChange: (v: File | null) => void = (v: File | null) => {
    return;
  };
  private _onTouch: () => void = () => {
    return;
  };

  public registerOnChange(fn: (v: File | null) => void) {
    this._onChange = fn;
  }

  public registerOnTouched(fn: () => void) {
    this._onTouch = fn;
  }

  public writeValue(val: File | null) {
    this.value = val;
  }

  public setDisabledState(disabled?: boolean) {
    // disabled state is not typically applied to file inputs
  }

  public reset() {
    this.value = null;
    this.fileName = '';
    this.dataType = '';
    this.fileExtension = '';
    this.fileSelected.next(null);
  }
}
