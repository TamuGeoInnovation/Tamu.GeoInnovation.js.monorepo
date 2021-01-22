import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { ColdWaterValvesService, MappedValve } from '../../../data-access/cold-water-valves/cold-water-valves.service';

@Component({
  selector: 'tamu-gisc-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  public valves: Observable<Array<MappedValve>>;

  constructor(private valveService: ColdWaterValvesService) {}

  public ngOnInit(): void {
    this.valves = this.valveService.valves;
  }
}
