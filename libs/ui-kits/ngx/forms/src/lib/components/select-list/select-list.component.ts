import {
  Component,
  forwardRef,
  OnChanges,
  OnInit,
  Renderer2,
  SimpleChanges,
  TemplateRef,
  ChangeDetectionStrategy,
  ElementRef,
  HostListener,
  inject,
  input,
  output
} from '@angular/core';
import { FormBuilder, NG_VALUE_ACCESSOR, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, debounceTime, map, Observable, shareReplay, startWith } from 'rxjs';
import { TextboxComponent } from '../textbox/textbox.component';
import { NgTemplateOutlet, AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-select-list',
  templateUrl: './select-list.component.html',
  styleUrls: ['./select-list.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectListComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, ReactiveFormsModule, TextboxComponent, NgTemplateOutlet, AsyncPipe]
})
export class SelectListComponent<T extends Record<string, unknown>> implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly renderer = inject(Renderer2);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Default placeholder text for the input.
   */
  public readonly placeholder = input('Begin typing to search...');

  /**
   * Whether to display the label above the input or use a static placeholder.
   */
  public readonly floatLabel = input(true);

  /**
   * List of options to display in the select list.
   */
  public readonly options = input<Array<T> | undefined>(undefined);

  /**
   * List of fields to search within the provided options.
   *
   * If omitted, the search will be performed on all fields which can be a performance concern for large datasets.
   *
   */
  public readonly searchFields = input<Array<keyof T> | undefined>(undefined);

  /**
   * Template reference to use for rendering each row in the select list.
   */
  public readonly rowTemplate = input<TemplateRef<T> | undefined>(undefined);

  /**
   * The item chosen from the list, by click, Enter or Space.
   */
  public readonly selected = output<T>();

  public readonly form = this.fb.group({
    search: ['']
  });

  public options$: Observable<Array<T>>;
  private _displayList$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public displayList$: Observable<boolean> = this._displayList$.asObservable();

  public ngOnInit(): void {
    // Options not given yet search as none: a search then threw on `undefined.filter` (#3495).
    this.initializeOptions(this.options() ?? []);

    this.renderer.listen('document', 'click', (event) => {
      event.activeElement = false;
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes?.options?.currentValue) {
      this.initializeOptions(changes.options.currentValue);
    }
  }

  /**
   * Reports the item, clears the search for the next one and moves focus out of the list, which closes it: the list
   * shows while focus is inside it, and the row just chosen held focus, so the list stayed open over the page (#2871).
   */
  public choose(item: T): void {
    this.selected.emit(item);
    this.form.controls.search.setValue('');

    const focused = document.activeElement as HTMLElement;

    if (this.host.nativeElement.contains(focused)) {
      focused.blur();
    }
  }

  /**
   * Escape in the open list closes it, as it does a drop-down: the list shows while focus is inside it, so focus moves
   * out. The Escape is claimed, so a page that gives Escape a meaning of its own (an admin details page going back to
   * its list, #2942) leaves it alone.
   */
  @HostListener('keydown.escape', ['$event'])
  public closeOnEscape(event: KeyboardEvent): void {
    if (this.rowTemplate() === undefined || event.defaultPrevented) {
      return;
    }

    event.preventDefault();

    const focused = document.activeElement as HTMLElement;

    if (this.host.nativeElement.contains(focused)) {
      focused.blur();
    }
  }

  private initializeOptions(options: Array<T>): void {
    this.options$ = this.form.controls.search.valueChanges.pipe(
      debounceTime(300),
      startWith(''),
      map((value) => {
        if (!value) {
          return options;
        }

        return options.filter((option) => {
          const searchFields = this.searchFields();
          const fields = searchFields && searchFields.length > 0 ? searchFields : Object.keys(option);

          return fields.some((field) => {
            return `${option[field]}`.toLowerCase().includes(value.toLowerCase());
          });
        });
      }),
      shareReplay(1)
    );
  }
}
