import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { SnapshotService } from '@tamu-gisc/cpa/data-access';

@Component({
  selector: 'tamu-gisc-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.scss']
})
export class DeleteComponent implements OnInit {
  public guid: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ss: SnapshotService,
    private ns: NotificationService
  ) {}

  public ngOnInit(): void {
    this.guid = this.route.snapshot.params.guid;
  }

  public deleteSnapshot() {
    if (this.guid) {
      this.ss.delete(this.guid).subscribe(
        (res) => {
          this.ns.toast({
            message: 'Snapshot was successfully deleted.',
            id: 'snapshot-delete',
            title: 'Snapshot Deleted'
          });

          this.router.navigate(['admin/snapshots']);
        },
        (err) => {
          this.ns.toast({
            message: 'Could not delete snapshot.',
            id: 'snapshot-delete',
            title: 'Snapshot Delete Failed'
          });
        }
      );
    }
  }
}
