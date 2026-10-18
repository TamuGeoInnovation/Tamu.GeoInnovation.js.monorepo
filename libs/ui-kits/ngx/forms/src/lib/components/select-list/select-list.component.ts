import {
  Component,
  forwardRef,
  OnChanges,
  OnInit,
  Renderer2,
  SimpleChanges,
  TemplateRef,
  ChangeDetectionStrategy,
  inject,
  input
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, NG_VALUE_ACCESSOR, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  private readonly fb = inject(UntypedFormBuilder);
  private readonly renderer = inject(Renderer2);

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
  public readonly options = input<Array<T>>(undefined);

  /**
   * List of fields to search within the provided options.
   *
   * If omitted, the search will be performed on all fields which can be a performance concern for large datasets.
   *
   */
  public readonly searchFields = input<Array<keyof T>>(undefined);

  /**
   * Template reference to use for rendering each row in the select list.
   */
  public readonly rowTemplate = input<TemplateRef<T>>(undefined);

  public form: UntypedFormGroup = this.fb.group({
    search: ['']
  });

  public options$: Observable<Array<T>>;
  private _displayList$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public displayList$: Observable<boolean> = this._displayList$.asObservable();

  public ngOnInit(): void {
    this.initializeOptions(this.options());

    this.renderer.listen('document', 'click', (event) => {
      event.activeElement = false;
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes?.options?.currentValue) {
      this.initializeOptions(changes.options.currentValue);
    }
  }

  private initializeOptions(options: Array<T>): void {
    this.options$ = this.form.get('search').valueChanges.pipe(
      debounceTime(300),
      startWith(''),
      map((value) => {
        if (!value) {
          return options;
        }

        return options.filter((option) => {
          const fields = this.searchFields()?.length > 0 ? this.searchFields() : Object.keys(option);

          return fields.some((field) => {
            return `${option[field]}`.toLowerCase().includes(value.toLowerCase());
          });
        });
      }),
      shareReplay(1)
    );
  }
}
