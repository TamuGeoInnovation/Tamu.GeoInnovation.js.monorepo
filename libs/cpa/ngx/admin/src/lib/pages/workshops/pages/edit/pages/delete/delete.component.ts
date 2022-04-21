import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { WorkshopService } from '@tamu-gisc/cpa/ngx/data-access';

@Component({
  selector: 'tamu-gisc-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.scss']
})
export class DeleteComponent implements OnInit {
  private guid: string;

  constructor(
    private ws: WorkshopService,
    private route: ActivatedRoute,
    private router: Router,
    private ns: NotificationService
  ) {}

  public ngOnInit(): void {
    this.guid = this.route.snapshot.params.guid;
  }

  public deleteWorkshop() {
    if (this.guid) {
      this.ws.deleteWorkshop(this.guid).subscribe(
        () => {
          this.ns.toast({
            message: 'Workshop was successfully deleted.',
            id: 'workshop-delete',
            title: 'Workshop Deleted'
          });

          this.router.navigate(['admin/workshops']);
        },
        () => {
          this.ns.toast({
            message: 'Workshop could not be deleted.',
            id: 'workshop-delete',
            title: 'Workshop Delete Failed'
          });
        }
      );
    }
  }
}
