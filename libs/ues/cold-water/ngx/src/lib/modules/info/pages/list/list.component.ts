import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, pluck, shareReplay, startWith, switchMap } from 'rxjs/operators';

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
  public where: Observable<string>;

  public categorized: Observable<ValvesCategorized>;
  public ratio: Observable<ValveStateRatio>;
  public filtered: Observable<Array<MappedValve>>;

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
      // tslint:disable-next-line: deprecation
      startWith(undefined)
    );

    this.where = combineLatest([this.searchTerm, this.filterOpen, this.filterClosed]).pipe(
      map(([term, filterOpen, filterClosed]) => {
        return this.generateWhere(term, filterOpen, filterClosed);
      })
    );

    this.valves = this.where.pipe(
      switchMap((wStatement) => {
        return this.valveService.getValves(50, 0, wStatement, true);
      }),
      shareReplay(1)
    );

    this.categorized = this.valves.pipe(
      map((valves) => {
        return valves.reduce(
          (acc, valve) => {
            if (valve.attributes.NormalPosition_1 === valve.attributes.CurrentPosition_1) {
              acc.normal.push(valve);
            } else if (valve.attributes.NormalPosition_1 !== valve.attributes.CurrentPosition_1) {
              acc.abnormal.push(valve);
            }

            return acc;
          },
          {
            abnormal: [],
            normal: []
          }
        );
      }),
      shareReplay(1)
    );

    this.filtered = combineLatest([this.filterOpen, this.filterClosed]).pipe(
      switchMap(([shouldFilterOpen, shouldFilterClosed]) => {
        return this.categorized.pipe(
          map((categorized) => {
            const filteredIn = [];
            if (shouldFilterClosed) {
              filteredIn.push(...categorized.abnormal);
            }

            if (shouldFilterOpen) {
              filteredIn.push(...categorized.normal);
            }

            return filteredIn;
          })
        );
      })
    );

    this.valvesStats = this.valveService.getValveStats().pipe(shareReplay());

    this.ratio = this.valvesStats.pipe(
      map((stats) => {
        return {
          normal: (stats.normal_valves / stats.total_valves) * 100,
          abnormal: (stats.abnormal_valves / stats.total_valves) * 100
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

  private generateWhere(searchTerm: string, filterNormal?: boolean, filterAbnormal?: boolean) {
    let where = '';

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

      where = makeWhere(searchAttributes, searchValues, operators, wildcards, transformations);
    }

    if (filterNormal || filterAbnormal) {
      let filters = '';

      if (filterNormal) {
        filters += 'NormalPosition_1 = CurrentPosition_1';

        if (filterAbnormal) {
          filters += ' OR ';
        }
      }

      if (filterAbnormal) {
        filters += '(NOT NormalPosition_1 = CurrentPosition_1) OR (NormalPosition_1 IS NULL OR CurrentPosition_1 IS NULL)';
      }

      if (where.length > 0) {
        where = `(${filters}) AND (${where})`;
      } else {
        where = filters;
      }
    }

    return where;
  }
}

interface ValveStateRatio {
  normal: number;
  abnormal: number;
}

interface ValvesCategorized {
  normal: Array<MappedValve>;
  abnormal: Array<MappedValve>;
}
