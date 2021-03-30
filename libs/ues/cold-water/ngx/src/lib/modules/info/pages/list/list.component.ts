import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';

import { ColdWaterValvesService, MappedValve } from '../../../core/services/cold-water-valves/cold-water-valves.service';

@Component({
  selector: 'tamu-gisc-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  public valves: Observable<Array<MappedValve>>;
  public ratio: Observable<ValveStateRatio>;
  public filtered: Observable<Array<MappedValve>>;

  public filterOpen: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public filterClosed: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private valveService: ColdWaterValvesService) {}

  public ngOnInit(): void {
    this.valves = this.valveService.valves.pipe(shareReplay());

    this.filtered = combineLatest([this.filterOpen, this.filterClosed]).pipe(
      switchMap(([shouldFilterOpen, shouldFilterClosed]) => {
        return this.valves.pipe(
          filter((v) => v !== undefined),
          map((valves) => {
            return valves.filter((v) => {
              if (v.attributes.NormalPosition_1 === v.attributes.CurrentPosition_1 && shouldFilterOpen === false) {
                return true;
              } else if (v.attributes.NormalPosition_1 !== v.attributes.CurrentPosition_1 && shouldFilterClosed === false) {
                return true;
              }

              return false;
            });
          })
        );
      })
    );

    this.ratio = this.valves.pipe(
      filter((v) => v !== undefined),
      map((valves) => {
        return valves.reduce(
          (acc, curr, index, arr) => {
            if (curr.attributes.NormalPosition_1 !== curr.attributes.CurrentPosition_1) {
              acc.closed++;
            } else {
              acc.open++;
            }

            if (index === arr.length - 1) {
              acc.open = (acc.open / arr.length) * 100;
              acc.closed = (acc.closed / arr.length) * 100;
            }

            return acc;
          },
          {
            open: 0,
            closed: 0
          }
        );
      })
    );
  }

  public tableFilter(toggle: 'closed' | 'open') {
    if (toggle === 'closed') {
      this.filterClosed.next(!this.filterClosed.getValue());
    } else {
      this.filterOpen.next(!this.filterOpen.getValue());
    }
  }
}

interface ValveStateRatio {
  open: number;
  closed: number;
}
