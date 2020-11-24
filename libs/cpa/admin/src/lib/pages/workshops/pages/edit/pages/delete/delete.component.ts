import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { WorkshopService } from '@tamu-gisc/cpa/data-access';

@Component({
  selector: 'tamu-gisc-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.scss']
})
export class DeleteComponent implements OnInit {
  private guid: string;

  constructor(private ws: WorkshopService, private route: ActivatedRoute, private router: Router) {}

  public ngOnInit(): void {
    this.guid = this.route.snapshot.params.guid;
  }

  public deleteWorkshop() {
    if (this.guid) {
      this.ws.deleteWorkshop(this.guid).subscribe((res) => {
        this.router.navigate(['admin/workshops']);
      });
    }
  }
}
