import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ColdWaterValvesService, MappedValve } from '../../../core/services/cold-water-valves/cold-water-valves.service';

@Component({
  selector: 'tamu-gisc-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy {
  public valve: Observable<MappedValve>;

  private _$destroy: Subject<boolean> = new Subject();

  constructor(private vs: ColdWaterValvesService, private route: ActivatedRoute) {}

  public ngOnInit(): void {
    this.valve = this.vs.selectedValve;

    this.route.params.pipe(takeUntil(this._$destroy)).subscribe((params) => {
      this.vs.setSelectedValve(params.id);
    });
  }

  public ngOnDestroy(): void {
    this._$destroy.next();
    this._$destroy.complete();
  }

  public toggleValveState(valve: MappedValve) {
    this.vs.updateValveState(valve);
  }
}
