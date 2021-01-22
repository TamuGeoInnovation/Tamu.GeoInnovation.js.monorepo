import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, pluck, withLatestFrom } from 'rxjs/operators';

import { ColdWaterValvesService, MappedValve } from '../../../data-access/cold-water-valves/cold-water-valves.service';

@Component({
  selector: 'tamu-gisc-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  public valve: Observable<MappedValve>;

  constructor(private vs: ColdWaterValvesService, private route: ActivatedRoute) {}

  public ngOnInit(): void {
    this.valve = this.vs.valves.pipe(
      filter((valves) => {
        return valves !== undefined;
      }),
      withLatestFrom(this.route.params.pipe(pluck<Params, string>('id'))),
      map(([valves, id]) => {
        return valves.find((valve) => valve.attributes.OBJECTID === parseInt(id, 10));
      })
    );
  }

  public toggleValveState(valve: MappedValve) {
    this.vs.updateValveState(valve);
  }
}
