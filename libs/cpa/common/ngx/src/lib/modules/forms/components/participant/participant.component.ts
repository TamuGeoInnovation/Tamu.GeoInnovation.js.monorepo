import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subject, Observable, forkJoin } from 'rxjs';
import { takeUntil, debounceTime, shareReplay, switchMap, pluck, take, skip } from 'rxjs/operators';

import * as uuid from 'uuid/v4';

import { ResponseService } from '../../services/response.service';
import { WorkshopService } from '../../services/workshop.service';

import {
  IWorkshopRequestPayload,
  IResponseResponse,
  IResponseRequestPayload,
  IScenariosResponse
} from '@tamu-gisc/cpa/data-api';
import { EsriMapService, EsriModuleProviderService, MapServiceInstance } from '@tamu-gisc/maps/esri';
import { getGeometryType } from '@tamu-gisc/common/utils/geometry/esri';
import { BaseDrawComponent } from '@tamu-gisc/maps/feature/draw';
import { IChartConfigurationOptions } from '@tamu-gisc/charts';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-participant',
  templateUrl: './participant.component.html',
  styleUrls: ['./participant.component.scss'],
  providers: [ResponseService, WorkshopService]
})
export class ParticipantComponent implements OnInit, OnDestroy {
  public workshop: Observable<IWorkshopRequestPayload>;
  public scenario: Observable<IScenariosResponse>;
  public responses: Observable<IResponseResponse[]>;

  public scenarioIndex: BehaviorSubject<number> = new BehaviorSubject(0);
  public responseIndex: BehaviorSubject<number> = new BehaviorSubject(-1);

  public participantGuid: string;

  public form: FormGroup;

  /**
   * Partial chart configuration passed to the chart component
   */
  public chartOptions: Partial<IChartConfigurationOptions> = {
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true
          }
        }
      ]
    }
  };

  /**
   * Stores the results of the features emitted by the draw component.
   *
   * Consumed by summary and charts component.
   */
  public selected = new BehaviorSubject([]);

  /**
   * Map draw component reference.
   *
   * Needed to call its public `draw` and `reset` methods.
   */
  @ViewChild(BaseDrawComponent, { static: true })
  private drawComponent: BaseDrawComponent;

  private _$destroy: Subject<boolean> = new Subject();

  constructor(
    private fb: FormBuilder,
    private mapService: EsriMapService,
    private ws: WorkshopService,
    private rs: ResponseService,
    private route: ActivatedRoute,
    private ms: EsriMapService,
    private mp: EsriModuleProviderService
  ) {}

  public ngOnInit() {
    this.initializeParticipant();

    this.form = this.fb.group({
      name: [''],
      notes: [''],
      drawn: [undefined, Validators.required]
    });

    if (this.route.snapshot.params['guid']) {
      this.workshop = this.ws.getWorkshop(this.route.snapshot.params['guid']).pipe(shareReplay(1));

      this.scenario = this.workshop.pipe(
        pluck<IResponseResponse, IScenariosResponse[]>('scenarios'),
        pluck(this.scenarioIndex.value),
        shareReplay(1)
      );

      this.responses = forkJoin([this.workshop, this.scenario]).pipe(
        switchMap(([workshop, scenario]) => {
          return this.rs.getResponsesForWorkshopAndScenario(workshop.guid, scenario.guid);
        })
      );

      // Reset the workspace with the response object at the responseIndex.
      this.responseIndex.pipe(switchMap((index) => this.responses.pipe(pluck(index)))).subscribe((res) => {
        if (res) {
          this.resetWorkspace((res as unknown) as IParticipantSubmission);
        }

        // Need to resub to the form status change stream.
        // Need to first terminate the existing stream to avoid multi-casting on the same
        // subscription.
        this._$destroy.next();

        // Create a subscription to the form and ignore the first emission, which will almost always be
        // the form population by value patching from existing submissions. Want to avoid calling
        // the update method when not necessary.
        this.form.statusChanges
          .pipe(
            skip(1),
            debounceTime(1000),
            takeUntil(this._$destroy)
          )
          .subscribe((status) => {
            if (status === 'VALID') {
              this.updateParticipantStore();
            }
          });
      });
    }

    // Load scenario layers
    forkJoin([this.ms.store, this.scenario, this.mp.require(['FeatureLayer'])]).subscribe(
      ([instances, scenario, [FeatureLayer]]: [MapServiceInstance, IScenariosResponse, [esri.FeatureLayerConstructor]]) => {
        const split = scenario.mapCenter.split(',').map((coordinate) => parseFloat(coordinate));

        instances.view.goTo({
          target: [split[0], split[1]],
          zoom: scenario.zoom
        });

        const layers = scenario.layers
          .map((l) => {
            return new FeatureLayer({
              url: l.url,
              title: l.info.name,
              opacity: 1 - parseInt((l.info.drawingInfo.transparency as unknown) as string, 10) / 100
            });
          })
          .reverse();

        instances.map.addMany(layers);
      }
    );
  }

  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }

  public async handleDrawSelection(e: esri.Graphic) {
    if (e.geometry) {
      const layer = this.mapService.findLayerById('highwater-claims-layer') as esri.FeatureLayer;

      let query;

      try {
        query = await layer.queryFeatures({
          spatialRelationship: 'intersects',
          geometry: e.geometry,
          outFields: ['*']
        });

        this.selected.next(query.features);
        this.form.controls.drawn.setValue(e);
      } catch (err) {
        console.error(err);
      }
    } else {
      this.selected.next([]);
      this.form.controls.drawn.setValue(undefined);
    }
  }

  public scan(direction: 'next' | 'prev') {
    // Need to take a single emission, otherwise the response index value push will cause a
    forkJoin([this.responseIndex.pipe(take(1)), this.responses]).subscribe(([index, responses]) => {
      if (direction === 'prev' && (index > 0 || index === -1)) {
        // Cannot walk to an index less than 0
        if (index > 0) {
          // Reset to the previous non-placeholder entry.
          this.responseIndex.next(index - 1);
        } else {
          // Reset to the last valid entry in the participants array. This block is hit whenever a new participant
          // is created but no value added to local store.
          this.responseIndex.next(responses.length - 1);
        }
      } else if (direction === 'next' && (index === -1 || this.form.valid)) {
        // If the current guid has an entry index that is less than the total participant entries - 2,
        // meaning "there is at least one more non-placeholder participant entries in the array",
        // scan to that one.
        //
        // If the current guid has an entry index that is less than the total participant entries -1,
        // meaning "there are no more non-placeholder participant entries in the array", create a new
        // placeholder submission
        if (index <= responses.length - 2) {
          this.responseIndex.next(index + 1);
        } else if (index <= responses.length - 1) {
          // Create a new participant placeholder
          this.resetWorkspace();
        }
      }
    });
  }

  /**
   * Resets any selected features.
   *
   * If provided a participant submission, will reset the workspace to
   * its value, restoring drawn features and selections.
   *
   * If no participant submission is provided, a new participant guid will be created,
   * as a placeholder for when new features are drawn on the map.
   */
  public resetWorkspace(submission?: IParticipantSubmission) {
    if (submission === undefined) {
      this.drawComponent.reset();
      this.form.reset();
      this.initializeParticipant();
    } else {
      this.drawComponent.reset();
      // Create an auto-castable graphic.
      // The cloned graphic does not have a geometry type so without it, the arcgis api will
      // error out.
      const autoCastable = {
        geometry: {
          ...submission.shapes.geometry,
          type: getGeometryType(submission.shapes.geometry)
        }
      } as esri.Graphic;

      // Draws submission graphics to the draw component target layer.
      this.drawComponent.draw([autoCastable]);

      // Set/Overwrite form values
      this.form.controls.name.setValue(submission.name);
      this.form.controls.notes.setValue(submission.notes);

      // Set the component participant state.
      this.initializeParticipant(submission.guid);
    }
  }

  /**
   * Updates the entry value of the current participant guid with the provided geometry.
   */
  private updateParticipantStore() {
    forkJoin([this.scenario, this.responses]).subscribe(([scenario, responses]) => {
      const parsed = (this.form.controls.drawn.value as esri.Graphic).toJSON();

      const submission: IResponseRequestPayload = {
        guid: this.participantGuid,
        name: this.form.controls.name.value,
        notes: this.form.controls.notes.value,
        shapes: parsed
      };

      const existing = responses.findIndex((r) => r.guid === this.participantGuid);

      if (existing > -1) {
        // If there is an existing submission for the current participant guid, replace its value with the new geometry.
        this.rs.updateResponse(submission.guid, submission).subscribe((updateStatus) => {
          console.log('updated');
        });
      } else {
        // If there is no existing submission for the current participant guid, add a dictionary index for the current
        // participant guid.
        submission.scenarioGuid = scenario.guid;
        submission.workshopGuid = this.route.snapshot.params['guid'];

        this.rs.createResponse(submission).subscribe((submissionStatus) => {
          console.log('created');
        });
      }
    });
  }

  private initializeParticipant(guid?: string) {
    if (guid) {
      this.participantGuid = guid;
    } else {
      this.participantGuid = uuid();
    }
  }
}

interface IParticipantSubmission extends Omit<IResponseRequestPayload, 'shapes'> {
  shapes: esri.Graphic;
}
