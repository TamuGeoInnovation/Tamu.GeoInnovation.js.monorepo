import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { IScenariosResponse } from '@tamu-gisc/cpa/data-api';

import { ScenarioService } from '@tamu-gisc/cpa/data-access';

@Component({
  selector: 'tamu-gisc-scenarios-list',
  templateUrl: './scenarios-list.component.html',
  styleUrls: ['./scenarios-list.component.scss'],
  providers: [ScenarioService]
})
export class ScenariosListComponent implements OnInit {
  public scenarios: Observable<IScenariosResponse[]>;
  constructor(private service: ScenarioService) {}

  public ngOnInit() {
    this.fetchRecords();
  }

  public delete(guid: string) {
    this.service.delete(guid).subscribe((deleteStatus) => {
      console.log(`Deleted ${guid}`);
      this.fetchRecords();
    });
  }

  public fetchRecords() {
    this.scenarios = this.service.getAll().pipe(shareReplay(1));
  }
}
