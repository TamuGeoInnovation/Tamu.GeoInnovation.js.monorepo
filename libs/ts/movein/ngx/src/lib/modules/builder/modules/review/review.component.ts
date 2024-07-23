import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

import { MoveInSettings } from '../../../../interfaces/move-in-out.interface';
import { MoveinOutService } from '../../../map/services/move-in-out/move-in-out.service';

@Component({
  selector: 'tamu-gisc-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit {
  public settings: MoveInSettings;
  public settingsValid = false;
  public moveDate: Date;

  constructor(
    private store: LocalStoreService,
    private router: Router,
    private route: ActivatedRoute,
    private move: MoveinOutService
  ) {}

  public ngOnInit() {
    this.settings = this.store.getStorage<MoveInSettings>({ primaryKey: 'aggiemap-movein' });

    if (this.settings !== undefined) {
      this.settingsValid =
        this.settings.date !== undefined && this.settings.residence !== undefined && this.settings.accessible !== undefined;

      if (this.settingsValid) {
        const d = this.move.getDateForDay('in', this.settings.date);

        if (d) {
          this.moveDate = new Date(new Date().getFullYear(), d.month - 1, d.day);
        }
      }
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
