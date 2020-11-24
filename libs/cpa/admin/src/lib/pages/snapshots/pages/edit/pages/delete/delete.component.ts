import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ScenarioService } from '@tamu-gisc/cpa/data-access';

@Component({
  selector: 'tamu-gisc-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.scss']
})
export class DeleteComponent implements OnInit {
  public guid: string;

  constructor(private router: Router, private route: ActivatedRoute, private ss: ScenarioService) {}

  public ngOnInit(): void {
    this.guid = this.route.snapshot.params.guid;
  }

  public deleteSnapshot() {
    if (this.guid) {
      this.ss.delete(this.guid).subscribe((res) => {
        this.router.navigate(['admin/snapshots']);
      });
    }
  }
}
