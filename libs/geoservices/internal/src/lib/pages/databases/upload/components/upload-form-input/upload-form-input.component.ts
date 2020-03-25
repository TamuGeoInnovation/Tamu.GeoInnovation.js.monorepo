import { Component, forwardRef, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Observable, fromEvent, of, merge } from 'rxjs';
import { switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { FileComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'tamu-gisc-upload-form-input',
  templateUrl: './upload-form-input.component.html',
  styleUrls: ['./upload-form-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UploadFormInputComponent),
      multi: true
    }
  ]
})
export class UploadFormInputComponent extends FileComponent implements OnInit {
  @ViewChild('dragArea', { static: true })
  private dragAreaRef: ElementRef;

  public dragOver: Observable<boolean>;

  public ngOnInit() {
    this.dragOver = merge(
      fromEvent(this.dragAreaRef.nativeElement, 'dragover'),
      fromEvent(this.dragAreaRef.nativeElement, 'dragleave'),
      fromEvent(this.dragAreaRef.nativeElement, 'drop')
    ).pipe(
      switchMap((event: DragEvent) => {
        return of(event.type === 'dragover' ? true : false);
      }),
      distinctUntilChanged(),
      debounceTime(100)
    );
  }
}
