import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EsriMapService } from '@tamu-gisc/maps/esri';

import { Observable, of, Subject } from 'rxjs';
import { catchError, pluck, shareReplay, switchMap, take, takeUntil } from 'rxjs/operators';

import { UserService } from '@tamu-gisc/ues/common/ngx';
import { ValveIntervention } from '@tamu-gisc/ues/cold-water/data-api';

import { ColdWaterValvesService, MappedValve } from '../../../core/services/cold-water-valves/cold-water-valves.service';
import { InterventionService } from '../../../core/services/intervention/intervention.service';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  providers: [InterventionService]
})
export class DetailsComponent implements OnInit, OnDestroy {
  public valve: Observable<MappedValve>;
  public routeValveId: Observable<number>;
  public interventions: Observable<Array<ValveIntervention>>;
  public updating = false;

  private _$destroy: Subject<boolean> = new Subject();

  constructor(
    private vs: ColdWaterValvesService,
    private route: ActivatedRoute,
    private router: Router,
    private ms: EsriMapService,
    private is: InterventionService,
    public user: UserService
  ) {}

  public ngOnInit(): void {
    this.valve = this.vs.selectedValve;
    this.routeValveId = this.route.params.pipe(pluck('id'));
    this.interventions = this.routeValveId.pipe(
      switchMap(v => {
        return this.is.getInterventionsForValve(v);
      }),
      catchError(err => {
        return of([]);
      }),
      shareReplay(1)
    )

    this.route.params.pipe(takeUntil(this._$destroy)).subscribe((params) => {
      this.vs.setSelectedValve(params.id);
    });

    this.valve.pipe(take(1)).subscribe((valve) => {
      this.ms.zoomTo({
        graphics: [valve]
      });
    });
  }

  public ngOnDestroy(): void {
    this.vs.clearSelectedValve();
    this._$destroy.next();
    this._$destroy.complete();
  }

  public toggleValveState(valve: MappedValve) {
    if (this.updating === true) {
      return;
    }

    this.user.permissions.isAdmin.subscribe((authorized) => {
      if (authorized === false) {
        return;
      }

      this.router.navigate(['intervention/new', valve.attributes.OBJECTID]);

      // if (valve && valve.attributes && valve.attributes.CurrentPosition_1 !== null) {
      //   const layer = valve.layer as esri.FeatureLayer;

      //   const cloned = valve.clone() as MappedValve;
      //   let updatedState: MappedValve['attributes']['CurrentPosition_1'];

      //   if (cloned.attributes.CurrentPosition_1 === 'Open') {
      //     updatedState = 'Closed';
      //     cloned.attributes.CurrentPosition_1 = updatedState;
      //   } else if (cloned.attributes.CurrentPosition_1 === 'Closed') {
      //     updatedState = 'Open';
      //     cloned.attributes.CurrentPosition_1 = updatedState;
      //   }

      //   this.updating = true;

      //   layer
      //     .applyEdits({
      //       updateFeatures: [cloned]
      //     })
      //     .then((res) => {
      //       layer.refresh();
      //       valve.attributes.CurrentPosition_1 = updatedState;
      //       this.updating = false;
      //     })
      //     .catch((err) => {
      //       this.updating = false;
      //       console.error(err);
      //     });
      // } else {
      //   console.warn('Valve does not have a valid position.', valve);
      // }
    });
  }
}
