import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';

import { ResponseService, WorkshopService } from '@tamu-gisc/cpa/data-access';

import { ViewerService } from '../../../viewer/services/viewer.service';

@Component({
  selector: 'tamu-gisc-scenario',
  templateUrl: './scenario.component.html',
  styleUrls: ['./scenario.component.scss'],
  providers: [ResponseService, WorkshopService],
})
export class ScenarioComponent implements OnInit, OnDestroy {
  public workshop = this.vs.workshop;
  private _$destroy: Subject<boolean> = new Subject();

  constructor(private route: ActivatedRoute, private rs: ResponseService, private vs: ViewerService) {}

  public ngOnInit(): void {
    if (this.route.snapshot.params['guid']) {
      this.vs.updateWorkshopGuid(this.route.snapshot.params.guid);

      // Fetch the total Responses for this Workshop
      this.rs.getResponsesForWorkshop(this.route.snapshot.params.guid);
    }
  }

  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }
}
