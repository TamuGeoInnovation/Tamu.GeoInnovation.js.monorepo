import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  pluck,
  shareReplay,
  startWith,
  switchMap,
  withLatestFrom
} from 'rxjs/operators';

import { makeWhere } from '@tamu-gisc/common/utils/database';

import {
  ColdWaterValvesService,
  IValve,
  IValveStats,
  MappedValve
} from '../../../core/services/cold-water-valves/cold-water-valves.service';

@Component({
  selector: 'tamu-gisc-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {
  public valves: Observable<Array<MappedValve>>;
  public valvesStats: Observable<IValveStats>;

  public form: FormGroup;
  public searchTerm: Observable<string>;
  public where: Observable<IWhere>;

  public ratio: Observable<ValveStateRatio>;

  public filterOpen: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public filterClosed: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public dcwToggled: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private valveService: ColdWaterValvesService, private fb: FormBuilder) {}

  public ngOnInit(): void {
    this.valveService.restoreMapExtent();

    this.form = this.fb.group({
      term: ['']
    });

    this.searchTerm = this.form.valueChanges.pipe(
      debounceTime(750),
      pluck('term'),
      distinctUntilChanged(),
      map((term) => {
        if (term === '') {
          return undefined;
        }

        return term;
      }),
      // The below use case is NOT actually deprecated. IDE is wrong.
      startWith(undefined),
      shareReplay()
    );

    this.where = combineLatest([this.searchTerm, this.filterOpen, this.filterClosed]).pipe(
      map(([term, filterOpen, filterClosed]) => {
        return this.generateWhere(term, filterOpen, filterClosed);
      })
    );

    this.valves = this.where.pipe(
      switchMap((whereProps) => {
        return this.valveService.getValves(50, 0, whereProps, true);
      }),
      shareReplay(1)
    );

    this.valvesStats = this.where.pipe(
      withLatestFrom(this.searchTerm),
      switchMap(([where, term]) => {
        // If the search term not an empty string, pass in the generated
        // where clause.
        //
        // With an empty string as a term, the valve stats will return stats for the
        // whole dataset.
        //
        // With a non-empty string as a term, the value stats will return stats for the
        // results of the where clause.
        const isTermFalsy = term === undefined || term === '';
        return this.valveService.getValveStats(isTermFalsy ? undefined : where);
      }),
      shareReplay(1)
    );

    this.ratio = this.valvesStats.pipe(
      map((stats) => {
        return {
          normal: stats.normal_valves > 0 ? (stats.normal_valves / stats.total_valves) * 100 : 0,
          abnormal: stats.abnormal_valves > 0 ? (stats.abnormal_valves / stats.total_valves) * 100 : 0
        };
      })
    );
  }

  public ngOnDestroy() {
    this.valveService.cacheMapExtent();
  }

  public tableFilter(toggle: 'closed' | 'open') {
    if (toggle === 'closed') {
      this.filterClosed.next(!this.filterClosed.getValue());
    } else {
      this.filterOpen.next(!this.filterOpen.getValue());
    }
  }

  public toggleDcw() {
    this.valveService.toggleColdWaterLines();
    this.dcwToggled.next(!this.dcwToggled.getValue());
  }

  public clearSearch() {
    this.form.patchValue({
      term: ''
    });
  }

  private generateWhere(searchTerm: string, filterNormal?: boolean, filterAbnormal?: boolean): IWhere {
    const ret = {
      where: '',
      filter: ''
    };

    // If both filters are disabled, then the where clause should be an explicit
    // falsy where clause
    if (filterNormal === false && filterAbnormal === false) {
      ret.where = '0=1';

      return ret;
    }

    if (searchTerm !== undefined) {
      const searchAttributes: Array<keyof IValve['attributes']> = [
        'Type',
        'Number',
        'OBJECTID',
        'VALVE_ID',
        'InspectName',
        'SystemType',
        'ValveLocation',
        'LocationDescription',
        'Condition',
        'ValveSize_1'
      ];
      const searchValues = new Array(searchAttributes.length).fill(searchTerm);
      const operators = new Array(searchAttributes.length).fill('LIKE');
      const wildcards = new Array(searchAttributes.length).fill('includes');
      const transformations = new Array(searchAttributes.length).fill('UPPER');

      ret.where = makeWhere(searchAttributes, searchValues, operators, wildcards, transformations);
    }

    if (filterNormal || filterAbnormal) {
      if (filterNormal) {
        ret.filter += 'NormalPosition_1 = CurrentPosition_1';

        if (filterAbnormal) {
          ret.filter += ' OR ';
        }
      }

      if (filterAbnormal) {
        ret.filter +=
          '(NOT NormalPosition_1 = CurrentPosition_1) OR (NormalPosition_1 IS NULL OR CurrentPosition_1 IS NULL)';
      }
    }

    return ret;
  }
}

export interface IWhere {
  /**
   * The actual generated where clause. Can be empty if no search term
   * is provided, in which case the generated filter can take the place
   * of the where clause.
   */
  where: string;

  /**
   * Prefix to a where clause that narrows down the query or selects only
   * valves in normal/abnormal position or both.
   */
  filter: string;
}
interface ValveStateRatio {
  normal: number;
  abnormal: number;
}
