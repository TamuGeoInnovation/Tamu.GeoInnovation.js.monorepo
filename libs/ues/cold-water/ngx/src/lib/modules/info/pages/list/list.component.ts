import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';

import {
  ColdWaterValvesService,
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

  public categorized: Observable<ValvesCategorized>;
  public ratio: Observable<ValveStateRatio>;
  public filtered: Observable<Array<MappedValve>>;

  public filterOpen: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public filterClosed: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public dcwToggled: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private valveService: ColdWaterValvesService) {}

  public ngOnInit(): void {
    this.valveService.restoreMapExtent();

    this.valves = this.valveService.valves.pipe(shareReplay(1));

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
}

interface ValveStateRatio {
  normal: number;
  abnormal: number;
}

interface ValvesCategorized {
  normal: Array<MappedValve>;
  abnormal: Array<MappedValve>;
}
