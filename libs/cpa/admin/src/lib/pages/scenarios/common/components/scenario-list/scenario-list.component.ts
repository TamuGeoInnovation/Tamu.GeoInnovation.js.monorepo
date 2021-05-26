import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { ScenarioService } from '@tamu-gisc/cpa/data-access';
import { IScenariosResponse } from '@tamu-gisc/cpa/data-api';

@Component({
  selector: 'tamu-gisc-scenario-list',
  templateUrl: './scenario-list.component.html',
  styleUrls: ['./scenario-list.component.scss']
})
export class ScenarioListComponent implements OnInit {
  public scenarios: Observable<IScenariosResponse[]>;
  constructor(private service: ScenarioService) {}

  public ngOnInit() {
    this.scenarios = this.service.getAll().pipe(shareReplay(1));
  }
}
