import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, map, shareReplay } from 'rxjs/operators';

import { getObjectPropertyValues } from '@tamu-gisc/common/utils/object';

import { RecyclingService, RecyclingLocationMetadata } from '../../../core/services/recycling.service';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-omnitoolbar',
  templateUrl: './omnitoolbar.component.html',
  styleUrls: ['./omnitoolbar.component.scss']
})
export class OmnitoolbarComponent<T extends esri.Graphic> implements OnInit, OnDestroy {
  @Input()
  public source: Array<T>;

  /**
   * Dot notation property string collection that will be resolved and used to match against
   * the text input.
   */
  @Input()
  public searchPaths: Array<string>;

  @Input()
  public displayTemplate: string;

  @Output()
  public selectedSuggestion: EventEmitter<T> = new EventEmitter();

  public form: FormGroup;
  public selectedLocation: Observable<RecyclingLocationMetadata>;
  public name: Observable<string>;
  public number: Observable<string>;
  public filteredResults: Observable<Array<T>>;

  private $destroy: Subject<boolean>;

  constructor(private recyclingService: RecyclingService, private fb: FormBuilder) {}

  public ngOnInit(): void {
    this.selectedLocation = this.recyclingService.selectedLocationMeta;

    this.name = this.selectedLocation.pipe(
      map((meta) => {
        return (meta && meta.Name) || undefined;
      })
    );

    this.number = this.selectedLocation.pipe(
      map((meta) => {
        return (meta && meta.bldNum) || undefined;
      })
    );

    this.form = this.fb.group({
      search: ['']
    });

    this.filteredResults = this.form.get('search').valueChanges.pipe(
      debounceTime(300),
      map((term) => {
        // If source is not yet an expected array, return early;
        if (this.source instanceof Array === false) {
          return;
        }

        return this.source.filter((sourceItem) => {
          if (term === '') {
            return sourceItem;
          } else {
            const resolvedProperties = getObjectPropertyValues(sourceItem, this.searchPaths).map((s) =>
              typeof s === 'string' ? s.trim().toLowerCase() : s
            ) as string[];

            return resolvedProperties.some((rp) => {
              return typeof rp === 'string' ? rp.includes(term.trim().toLowerCase()) : false;
            });
          }
        });
      }),
      shareReplay(1)
    );

    this.selectedLocation.subscribe((location) => {
      if (location === undefined) {
        this.form.reset();
      } else {
        this.form.patchValue({
          search: this.getLocationDisplay(location)
        });
      }
    });
  }

  public ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  public clear(): void {
    this.recyclingService.clearSelected();
  }

  public select(selection: T): void {
    this.selectedSuggestion.emit(selection);
    this.recyclingService.setLocation(selection);
  }

  private getLocationDisplay(location: RecyclingLocationMetadata): string {
    return `${location.Name} ${location.bldNum ? '(' + location.bldNum + ')' : ''}`.trim();
  }
}
