import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, pipe, Subject } from 'rxjs';
import { filter, map, pluck, takeUntil } from 'rxjs/operators';

import { ViewerService } from './services/viewer.service';

@Component({
  selector: 'tamu-gisc-viewer',
  templateUrl: './cpa-ngx-viewer.component.html',
  styleUrls: ['./cpa-ngx-viewer.component.scss']
})
export class ViewerComponent implements OnInit, OnDestroy {
  public showAdminControls: Observable<boolean>;

  private _$destroy: Subject<boolean> = new Subject();

  constructor(private route: ActivatedRoute, private vs: ViewerService) {}

  public ngOnInit() {
    this.route.queryParams.pipe(pluck('workshop'), filterFalsy(), takeUntil(this._$destroy)).subscribe((w) => {
      this.vs.updateWorkshopGuid(w);
    });

    this.route.queryParams.pipe(pluck('participant'), filterFalsy(), takeUntil(this._$destroy)).subscribe((p) => {
      this.vs.updateParticipantGuid(p);
    });

    this.route.queryParams.pipe(pluck('event'), filterFalsy(), takeUntil(this._$destroy)).subscribe((e) => {
      this.vs.updateSelectionGuid(e);
    });

    this.showAdminControls = this.route.queryParams.pipe(
      pluck('controls'),
      map((param) => {
        if (param === 'true' || param === true) {
          return true;
        }

        return false;
      })
    );
  }

  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }
}

function filterFalsy() {
  return pipe(
    filter((eg: string) => {
      return eg !== null && eg !== undefined && eg !== '';
    })
  );
}
