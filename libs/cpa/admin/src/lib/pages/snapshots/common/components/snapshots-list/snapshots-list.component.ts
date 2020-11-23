import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { ScenarioService } from '@tamu-gisc/cpa/data-access';
import { ISnapshotsResponse } from '@tamu-gisc/cpa/data-api';

@Component({
  selector: 'tamu-gisc-snapshots-list',
  templateUrl: './snapshots-list.component.html',
  styleUrls: ['./snapshots-list.component.scss']
})
export class SnapshotsListComponent implements OnInit {
  public snapshots: Observable<ISnapshotsResponse[]>;
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
    this.snapshots = this.service.getAll().pipe(shareReplay(1));
  }
}
