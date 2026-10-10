import { Directive, ElementRef, Input, OnDestroy, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';

import { Observable, timer } from 'rxjs';
import { mapTo, startWith } from 'rxjs/operators';

// `clipboard` is CommonJS and exports its class directly. A default import hands over the class both to
// esbuild and, with esModuleInterop (#1476), to ts-jest. `import = require` cannot be loaded by the
// browser bundle the dev server serves (#1558), and a namespace import is not constructable.
import Clipboard from 'clipboard';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[clipboard-copy]'
})
export class ClipboardCopyDirective implements OnChanges, OnDestroy {
  private el = inject(ElementRef);

  /**
   * Text string that will be copied to clipboard.
   */
  @Input()
  public text: string;

  @Output()
  public copying: EventEmitter<Observable<boolean>> = new EventEmitter();

  @Output()
  public err: EventEmitter<boolean> = new EventEmitter();

  /**
   * Clipboard JS class container.
   *
   * Reference allows unbinding on component destroy
   */
  private _clipboard: InstanceType<typeof Clipboard>;

  /**
   * OnChanges Hook
   *
   * Destroy any existing clipboard instances and create a new one when the input text model is changed by the parent.
   *
   * This results when the user selects a different travel mode and the directions re-render. At which point, this
   * hook will be called to reset the clipboard text copied on trigger.
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
   * On component destroy, release the clipboard evenT handlers.
   */
  public ngOnDestroy() {
    if (this._clipboard) {
      this._clipboard.destroy();
    }
  }

  private _initializeHandler() {
    this._clipboard = new Clipboard(this.el.nativeElement, {
      text: () => {
        return this.text;
      }
    })
      .on('success', () => {
        // On clipboard copy success, emit timer stream that can be used to display UI effects.
        this.copying.emit(timer(750).pipe(mapTo(false), startWith(true)));
      })
      .on('error', () => {
        this.err.emit(true);
      });
  }
}
