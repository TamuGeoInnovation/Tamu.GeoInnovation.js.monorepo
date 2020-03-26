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
  /**
   * Determines the checked state of the checkbox ref element.
   *
   * Defaults to `false`.
   */
  // tslint:disable-next-line:no-input-rename
  @Input('value')
  private _value = false;

  @Output()
  public fileSelected: EventEmitter<SelectedFile> = new EventEmitter();

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
    const reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const [file]: [File] = event.target.files;

      // Pull the name for the file
      this.fileName = file.name;

      // Pull the data type for the file
      this.dataType = file.type;

      // Pull the file extension from the file.
      this.fileExtension =
        file.name.split('.').length > 0
          ? file.name
              .split('.')
              .pop()
              .toLowerCase()
          : 'unkown';

      reader.readAsDataURL(file);

      reader.onload = () => {
        this.value = reader.result;

        this.fileSelected.emit({
          name: this.fileName,
          type: this.dataType,
          extension: this.fileExtension,
          size: file.size,
          content: reader.result
        });
      };
    }
  }

  private _onChange = (v) => {};
  private _onTouch = () => {};

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
}

export interface SelectedFile {
  name: string;
  type: string;
  extension: string;
  size: number;
  content: string | ArrayBuffer;
}
