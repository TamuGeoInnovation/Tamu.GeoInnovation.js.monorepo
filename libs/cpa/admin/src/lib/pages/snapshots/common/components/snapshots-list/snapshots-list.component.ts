import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { SnapshotService } from '@tamu-gisc/cpa/data-access';
import { ISnapshotsResponse } from '@tamu-gisc/cpa/data-api';

@Component({
  selector: 'tamu-gisc-snapshots-list',
  templateUrl: './snapshots-list.component.html',
  styleUrls: ['./snapshots-list.component.scss']
})
export class SnapshotsListComponent implements OnInit {
  public snapshots: Observable<ISnapshotsResponse[]>;
  constructor(private service: SnapshotService, private router: Router, private route: ActivatedRoute) {}

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

  public createCopy(donorGuid: string) {
    this.service.createCopy(donorGuid).subscribe((status) => {
      this.router.navigate(['./edit', status.guid], { relativeTo: this.route });
    });
  }
}
