import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EsriMapService } from '@tamu-gisc/maps/esri';

import { Observable, of, Subject } from 'rxjs';
import { catchError, map, pluck, shareReplay, switchMap, take, takeUntil } from 'rxjs/operators';

import { UserService } from '@tamu-gisc/ues/common/ngx';
import { ValveIntervention } from '@tamu-gisc/ues/cold-water/data-api';

import {
  ColdWaterValvesService,
  IValve,
  MappedValve
} from '../../../core/services/cold-water-valves/cold-water-valves.service';
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
  /**
   * Ordered valve properties in a Map.
   */
  public valveAttributes: Observable<IValve['attributes']>;
  public valveLayerFields: Observable<Array<esri.Field>>;
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
      switchMap((v) => {
        return this.is.getInterventionsForValve(v).pipe(
          // If the request returns with a not found, default to an empty array as a value for each
          // emission of routeValveId
          catchError((err, caught) => {
            return of([]);
          })
        );
      }),
      shareReplay(1)
    );

    this.route.params.pipe(takeUntil(this._$destroy)).subscribe((params) => {
      this.vs.setSelectedValve(params.id);
    });

    this.valve.pipe(take(1)).subscribe((valve) => {
      this.ms.zoomTo({
        graphics: [valve]
      });
    });

    this.valveAttributes = this.valve.pipe(
      map((valve) => {
        const priorityValveAttributes: Array<keyof IValve['attributes']> = ['OBJECTID', 'CurrentPosition_1', 'NormalPosition_1'];

        const orderedAttributes = Object.entries(valve.attributes).reduce((sorted, [currentKey, currentValue]) => {
          const keyPriorityIndex = priorityValveAttributes.indexOf(currentKey as keyof IValve['attributes']);

          if (keyPriorityIndex !== -1) {
            sorted.splice(keyPriorityIndex, 0, [currentKey, currentValue]);
          } else {
            sorted.push([currentKey, currentValue]);
          }

          return sorted;
        }, []);

        const mapped = orderedAttributes.reduce((acc, [key, value]) => {
          acc.set(key, value);

          return acc;
        }, new Map());

        return mapped;
      })
    );

    this.valveLayerFields = this.valve.pipe(
      map((valve) => {
        return (valve.layer as esri.FeatureLayer).fields;
      })
    );
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
    });
  }

  // Sorting function passed into the keyvalue angular pipe to preserve property order when iterating.
  public readonly tableSortOrigOrder = (a, b): number => {
    return 0;
  };
}
