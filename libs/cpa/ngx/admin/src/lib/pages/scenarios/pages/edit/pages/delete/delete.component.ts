import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ScenarioService } from '@tamu-gisc/cpa/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

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
    private ss: ScenarioService,
    private ns: NotificationService
  ) {}

  public ngOnInit(): void {
    this.guid = this.route.snapshot.params.guid;
  }

  public deleteScenario() {
    if (this.guid) {
      this.ss.delete(this.guid).subscribe(
        () => {
          this.ns.toast({
            message: 'Scenario was successfully deleted.',
            id: 'scenario-delete',
            title: 'Scenario Deleted'
          });

          this.router.navigate(['admin/scenarios']);
        },
        () => {
          this.ns.toast({
            message: 'An error ocurred. Scenario could not be deleted.',
            id: 'scenario-delete',
            title: 'Scenario Delete Failed'
          });
        }
      );
    }
  }
}
