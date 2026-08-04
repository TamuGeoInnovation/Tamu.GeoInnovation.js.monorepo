import {
  Component,
  forwardRef,
  Input,
  OnChanges,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
  TemplateRef
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BehaviorSubject, debounceTime, map, Observable, shareReplay, startWith } from 'rxjs';

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
  ]
})
export class SelectListComponent<T extends Record<string, unknown>> implements OnInit, OnChanges {
  /**
   * Default placeholder text for the input.
   */
  @Input()
  public placeholder = 'Begin typing to search...';

  /**
   * Whether to display the label above the input or use a static placeholder.
   */
  @Input()
  public floatLabel = true;

  /**
   * List of options to display in the select list.
   */
  @Input()
  public options: Array<T>;

  /**
   * List of fields to search within the provided options.
   *
   * If omitted, the search will be performed on all fields which can be a performance concern for large datasets.
   *
   */
  @Input()
  public searchFields: Array<keyof T>;

  /**
   * Template reference to use for rendering each row in the select list.
   */
  @Input()
  public rowTemplate: TemplateRef<T>;

  /**
   * When a selection is made, the selected value will be emitted.
   */
  @Output()
  public selected: T;

  public form: UntypedFormGroup = this.fb.group({
    search: ['']
  });

  public options$: Observable<Array<T>>;
  private _displayList$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public displayList$: Observable<boolean> = this._displayList$.asObservable();

  constructor(private readonly fb: UntypedFormBuilder, private readonly renderer: Renderer2) {}

  public ngOnInit(): void {
    this.initializeOptions(this.options);

    this.renderer.listen('document', 'click', (event) => {
      event.activeElement = false;
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const optionsChange = changes['options'];
    if (optionsChange?.currentValue) {
      this.initializeOptions(optionsChange.currentValue);
    }
  }

  private initializeOptions(options: Array<T>): void {
    const searchControl = this.form.get('search');
    if (!searchControl) {
      return;
    }
    
    this.options$ = searchControl.valueChanges.pipe(
      debounceTime(300),
      startWith(''),
      map((value) => {
        if (!value) {
          return options;
        }

        return options.filter((option) => {
          const fields = this.searchFields?.length > 0 ? this.searchFields : Object.keys(option);

          return fields.some((field) => {
            return `${option[field]}`.toLowerCase().includes(value.toLowerCase());
          });
        });
      }),
      shareReplay(1)
    );
  }
}
