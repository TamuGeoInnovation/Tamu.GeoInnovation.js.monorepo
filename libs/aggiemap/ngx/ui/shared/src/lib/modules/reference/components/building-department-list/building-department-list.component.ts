import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SearchService, SearchSource } from '@tamu-gisc/ui-kits/ngx/search';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

// Pre-defined search source reference to use in the building department search.
const searchReference = 'university-departments-exact';

@Component({
  selector: 'tamu-gisc-building-department-list',
  templateUrl: './building-department-list.component.html',
  styleUrls: ['./building-department-list.component.scss'],
  providers: [SearchService]
})
export class BuildingDepartmentListComponent implements OnInit, OnDestroy {
  @Input()
  public buildingNumber: string;

  public result: any[] = [];

  private source: number;

  private _sources: SearchSource[] = [];

  private _destroy$: Subject<boolean> = new Subject();

  constructor(private searchService: SearchService, private environment: EnvironmentService) {
    if (this.environment.value('SearchSources')) {
      this._sources = this.environment.value('SearchSources');
    }
    // Check if the defined search source exists.
    this.source = this._sources.findIndex((s) => s.source === searchReference);

    if (this.source === -1) {
      throw new Error(`'${searchReference}' search source was not found in configuration.`);
    }
  }

  public ngOnInit() {
    if (!this.buildingNumber) {
      console.warn(`Building number not provided. Could not perform department home lookup.`);
    }

    // If a building number is provided by the parent component, perform the search.
    this.searchService
      .search({
        sources: [searchReference],
        values: [this.buildingNumber],
        stateful: false
      })
      .pipe(takeUntil(this._destroy$))
      .subscribe((result) => {
        // Store the result in component scope. Be defensive — features() may be undefined or non-array.
        try {
          const features = (result && typeof result.features === 'function') ? result.features() : [];
          this.result = Array.isArray(features) ? features : [];
        } catch (e) {
          // In case the result object is unexpected, fallback to empty array.
          this.result = [];
          console.warn('Unexpected search result shape in BuildingDepartmentListComponent', e);
        }
      });
  }

  public ngOnDestroy() {
    // Unsubscribe from any open observable streams.
    this._destroy$.next(true);
    this._destroy$.complete();
  }
}
