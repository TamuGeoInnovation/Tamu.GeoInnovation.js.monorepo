import { HttpClient } from '@angular/common/http';
import {
  combineLatest,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  switchMap,
  tap,
  toArray
} from 'rxjs';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';

import { DatatableComponent, TableColumn } from '@swimlane/ngx-datatable';

@Component({
  selector: 'tamu-gisc-aggiemap-directory',
  templateUrl: './directory.component.html',
  styleUrls: ['./directory.component.scss']
})
export class DirectoryComponent implements OnInit {
  public form: UntypedFormGroup;

  @ViewChild(DatatableComponent)
  public table: DatatableComponent;

  public _rows$: Observable<Array<BuildingDirectoryEntry>>;
  // Define the columns for the datatable
  public columns: TableColumn[] = [
    { name: 'Name', prop: 'BldgName', canAutoResize: true, width: 350 },
    { name: 'Number', prop: 'Bldg', canAutoResize: true },
    { name: 'Abbreviation', prop: 'BldgAbbrev', canAutoResize: true }
  ];

  public loadingIndicator = true;
  private _data$: Observable<Array<BuildingDirectoryEntry>>;

  constructor(private readonly http: HttpClient, private readonly fb: UntypedFormBuilder) {}

  public ngOnInit(): void {
    this._data$ = this.http.get<Array<BuildingDirectoryEntry>>('/assets/data/building-directory.json').pipe(
      concatMap((data) => data),
      map((buildingEntry) => {
        // If the building abbreviation is a number, set it to an empty string (per requirements)
        if (!isNaN(Number(buildingEntry.BldgAbbr))) {
          buildingEntry.BldgAbbr = '';
        }

        return buildingEntry;
      }),
      toArray(),
      shareReplay(1)
    );

    this.form = this.fb.group({
      search: [null]
    });

    this._rows$ = combineLatest([
      this._data$,
      (this.form.get('search') as UntypedFormControl).valueChanges.pipe(startWith(null), debounceTime(300), distinctUntilChanged())
    ]).pipe(
      tap(() => {
        this.loadingIndicator = true;
      }),
      switchMap(([data, search]) => {
        if (search) {
          const filtered = data.filter((building) => {
            const searchLower = search.toLowerCase();

            return (
              building.BldgName.toLowerCase().includes(searchLower) ||
              building.BldgAbbr.toLowerCase().includes(searchLower) ||
              String(building.Bldg).toLowerCase().includes(searchLower) // Bldg is sometimes a number in the data set
            );
          });
          return of(filtered);
        } else {
          return of(data);
        }
      }),
      tap(() => {
        this.loadingIndicator = false;
        if (this.table) {
          this.table.offset = 0;
        }
      })
    );
  }
}

interface BuildingDirectoryEntry {
  Bldg: string;
  BldgName: string;
  BldgAbbr: string;
  OwnerFICE: string;
  OwnerAbbr: string;
  StatusCode: string;
  Status: string;
  SiteLocCode: string;
  SiteLocCodeDescription: string;
  LocationType: string;
  LocationTypeDescription: string;
  ConditionCode: string;
  TypeCode: string;
  YearBuilt: string | number;
  Address1: string;
  City: string;
  ZipCode: string | number;
}
