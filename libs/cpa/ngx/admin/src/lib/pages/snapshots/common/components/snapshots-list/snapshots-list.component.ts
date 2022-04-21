import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { SnapshotService } from '@tamu-gisc/cpa/ngx/data-access';
import { ISnapshotPartial } from '@tamu-gisc/cpa/data-api';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

@Component({
  selector: 'tamu-gisc-snapshots-list',
  templateUrl: './snapshots-list.component.html',
  styleUrls: ['./snapshots-list.component.scss']
})
export class SnapshotsListComponent implements OnInit {
  public snapshots: Observable<ISnapshotPartial[]>;

  constructor(
    private service: SnapshotService,
    private router: Router,
    private route: ActivatedRoute,
    private ns: NotificationService
  ) {}

  public ngOnInit() {
    this.snapshots = this.service.getSimplifiedWithWorkshops().pipe(shareReplay(1));
  }

  public createCopy(donorGuid: string) {
    this.service.createCopy(donorGuid).subscribe(
      (status) => {
        this.ns.toast({
          message: 'Snapshot was successfully copied.',
          id: 'snapshot-copy',
          title: 'Snapshot Copied'
        });

        this.router.navigate(['./edit', status.guid], { relativeTo: this.route });
      },
      () => {
        this.ns.toast({
          message: 'Snapshot could not be copied.',
          id: 'snapshot-copy',
          title: 'Snapshot Copy Failed'
        });
      }
    );
  }
}
