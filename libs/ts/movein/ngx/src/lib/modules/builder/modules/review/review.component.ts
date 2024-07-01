import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

import { MoveInSettings } from '../../../../interfaces/move-in-out.interface';

@Component({
  selector: 'tamu-gisc-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit {
  constructor(private store: LocalStoreService, private router: Router, private route: ActivatedRoute) {}

  public settings: MoveInSettings;
  public settingsValid = false;

  public ngOnInit() {
    this.settings = this.store.getStorage<MoveInSettings>({ primaryKey: 'aggiemap-movein' });

    if (this.settings !== undefined) {
      this.settingsValid =
        this.settings.date !== undefined && this.settings.residence !== undefined && this.settings.accessible !== undefined;
    }
  }

  public next = (route: string, params?: { ret: string }) => {
    if (route && params) {
      this.router.navigate([`${route}`], { queryParams: { ...params } });
    } else if (route && !params) {
      this.router.navigate([`${route}`]);
    }
  };
}
