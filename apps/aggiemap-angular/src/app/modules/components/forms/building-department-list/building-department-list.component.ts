import { Component, OnInit, Input, OnDestroy, Inject, Optional } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SearchService, SearchSource } from '@tamu-gisc/search';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

// Pre-defined search source reference to use in the building department search.
const searchReference = 'university-departments-exact';

@Component({
  selector: 'building-department-list',
  templateUrl: './building-department-list.component.html',
  styleUrls: ['./building-department-list.component.scss'],
  providers: [SearchService]
})
export class BuildingDepartmentListComponent implements OnInit, OnDestroy {
  @Input()
  public buildingNumber: string;

  public result;

  private source: number;

  private _sources: SearchSource[];

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
        // Store the result in component scope.
        this.result = result.features();
      });
  }

  public ngOnDestroy() {
    // Unsubscribe from any open observable streams.
    this._destroy$.next();
    this._destroy$.complete();
  }
}
