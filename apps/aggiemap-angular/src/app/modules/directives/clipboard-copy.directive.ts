import { Directive, ElementRef, Input, OnDestroy, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

import { Observable, timer } from 'rxjs';
import { mapTo, startWith } from 'rxjs/operators';

import * as Clipboard from 'clipboard';

@Directive({
  selector: '[clipboard-copy]'
})
export class ClipboardCopyDirective implements OnChanges, OnDestroy {
  /**
   * Text string that will be copied to clipboard.
   *
   * @type {string}
   * @memberof ClipboardCopyDirective
   */
  @Input()
  public text: string;

  @Output()
  public copying: EventEmitter<Observable<boolean>> = new EventEmitter();

  /**
   * Clipboard JS class container.
   *
   * Reference allows unbinding on component destroy
   *
   * @private
   * @type {*}
   * @memberof ClipboardCopyDirective
   */
  private _clipboard: Clipboard;

  constructor(private el: ElementRef) {}

  /**
   * OnChanges Hook
   *
   * Destroy any existing clipboard instances and create a new one when the input text model is changed by the parent.
   *
   * This results when the user selects a different travel mode and the directions re-render. At which point, this
   * hook will be called to reset the clipboard text copied on trigger.
   *
   * @memberof ClipboardCopyDirective
   */
  public ngOnChanges(changes: SimpleChanges) {
    if (changes.text) {
      if (changes.text.firstChange) {
        this._initializeHandler();
      } else {
        this._clipboard.destroy();
        this._initializeHandler();
      }
    }
  }

  /**
   * OnDestroy Hook
   *
   * On component destroy, release the clipboard evenhandlers.
   *
   * @memberof ClipboardCopyDirective
   */
  public ngOnDestroy() {
    this._clipboard.destroy();
  }

  private _initializeHandler() {
    this._clipboard = new Clipboard(this.el.nativeElement, {
      text: (trigger) => {
        return this.text;
      }
    }).on('success', (e) => {
      // On clipboard copy success, emit timer stream that can be used to display UI effects.
      this.copying.emit(
        timer(750).pipe(
          mapTo(false),
          startWith(true)
        )
      );
    });
  }
}
