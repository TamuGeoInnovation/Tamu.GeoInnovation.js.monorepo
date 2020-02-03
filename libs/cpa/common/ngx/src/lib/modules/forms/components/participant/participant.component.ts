import { Component, OnInit, ViewChild, OnDestroy, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  BehaviorSubject,
  Subject,
  Observable,
  forkJoin,
  merge,
  interval,
  of,
  combineLatest,
  from,
  ReplaySubject
} from 'rxjs';
import {
  takeUntil,
  debounceTime,
  shareReplay,
  switchMap,
  pluck,
  take,
  throttle,
  withLatestFrom,
  filter,
  tap,
  skip
} from 'rxjs/operators';

import * as uuid from 'uuid/v4';

import {
  IWorkshopRequestPayload,
  IResponseResponse,
  IResponseRequestPayload,
  IScenariosResponse,
  IScenariosRequestPayload
} from '@tamu-gisc/cpa/data-api';
import { EsriMapService, EsriModuleProviderService, MapServiceInstance } from '@tamu-gisc/maps/esri';
import { getGeometryType } from '@tamu-gisc/common/utils/geometry/esri';
import { BaseDrawComponent } from '@tamu-gisc/maps/feature/draw';
import { IChartConfigurationOptions } from '@tamu-gisc/charts';

import { ResponseService } from '../../services/response.service';
import { WorkshopService } from '../../services/workshop.service';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-participant',
  templateUrl: './participant.component.html',
  styleUrls: ['./participant.component.scss'],
  providers: [ResponseService, WorkshopService]
})
export class ParticipantComponent implements OnInit, OnDestroy {
  @Output()
  public responseSave: EventEmitter<boolean> = new EventEmitter();

  public workshop: Observable<IWorkshopRequestPayload>;
  public scenario: Observable<IScenariosResponse>;
  public responses: Observable<IResponseResponse[]>;

  public scenarioHistory: BehaviorSubject<IScenariosResponse[]> = new BehaviorSubject([]);
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

  private _$formReset: Subject<boolean> = new Subject();
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

      this.scenario = combineLatest([this.workshop, this.scenarioIndex]).pipe(
        switchMap(([workshop, scenarioIndex]: [IWorkshopRequestPayload, number]) => {
          return of(workshop).pipe(
            pluck<IResponseResponse, IScenariosResponse[]>('scenarios'),
            pluck(scenarioIndex)
          );
        }),
        tap((scenario) => {
          this.addToScenarioHistory(scenario);
        }),
        shareReplay(1)
      );

      this.scenario
        .pipe(
          skip(1),
          takeUntil(this._$destroy)
        )
        .subscribe((res) => {
          this.resetWorkspace();
        });

      // Fetch new responses from server whenever scenario, response index, or response save signal emits.
      this.responses = merge(this.scenario, this.responseIndex, this.responseSave).pipe(
        switchMap((event) => {
          return forkJoin([this.workshop, this.scenario.pipe(take(1))]);
        }),
        switchMap(([workshop, scenario]) => {
          return this.rs.getResponsesForWorkshopAndScenario(workshop.guid, scenario.guid);
        }),
        shareReplay(1)
      );

      // Reset workspace whenever there is a new set of responses from the server,
      // and the current participant guid is different than the response at the
      // responseIndex.
      //
      // This will ensure that the workspace does not reset every time the form
      // publishes a VALID status change.
      this.responses
        .pipe(
          withLatestFrom(this.responseIndex),
          filter(([response, index]) => {
            return response[index] && response[index].guid !== this.participantGuid;
          }),
          switchMap(([responses, index]) => {
            return of(responses[index]);
          }),
          takeUntil(this._$destroy)
        )
        .subscribe((res) => {
          if (res) {
            this.resetWorkspace(res as IParticipantSubmission);
          }
        });

      // Whenever the responseIndex changes, re-initiate the form statusChanges
      // subscription. Because a change in the response index also means the
      // workspace is going to be reset and new form values applied, the form
      // will trigger a submission form operation on a validity status change.
      //
      // This behavior will cause an unnecessary participant submission update
      // on every responseIndex change. To prevent this, clear the old subscription
      // and re-initialize a new one on form statusChanges observable.
      this.responseIndex.pipe(takeUntil(this._$destroy)).subscribe(() => {
        // Need to resubscribe to the form status change stream.
        // Need to first terminate the existing stream to avoid multi-casting on the same
        // subscription.
        this._$formReset.next();

        // Create a subscription to the form and ignore the first emission, which will almost always be
        // the form population by value patching from existing submissions. Want to avoid calling
        // the update method when not necessary.
        this.form.statusChanges
          .pipe(
            throttle(() => interval(500)),
            debounceTime(1000),
            takeUntil(this._$formReset)
          )
          .subscribe((status) => {
            if (status === 'VALID') {
              this.updateOrCreateSubmission();
            }
          });
      });
    }

    // Use ScenarioHistory observable to determine a scenario change which requires the addition of new layers
    // and/or removal of old scenario layers
    combineLatest([this.scenarioHistory, this.ms.store, from(this.mp.require(['FeatureLayer']))]).subscribe(
      ([scenarioHistory, instances, [FeatureLayer]]: [
        IScenariosResponse[],
        MapServiceInstance,
        [esri.FeatureLayerConstructor]
      ]) => {
        // Find any layers associated with the current scenario and clear them to prepare to add layers from the next scenario
        const prevScenario = scenarioHistory.length > 1 ? scenarioHistory[0] : undefined;
        const currScenario = scenarioHistory.length > 1 ? scenarioHistory[1] : scenarioHistory[0];

        if (!currScenario) {
          return;
        }

        if (prevScenario) {
          const prevLayers = prevScenario.layers
            .map((l) => {
              return instances.map.layers.find((ml) => {
                return ml.id === l.info.layerId;
              });
            })
            .filter((r) => r !== undefined);

          if (prevLayers.length > 0) {
            instances.map.removeMany(prevLayers);
          }
        }

        // Queue the new layers on the next event loop, otherwise any layers that need removed
        // will not have been removed until then and will not appear in the legend.
        setTimeout(() => {
          // Parse coordinates form scenario string definition
          const split = currScenario.mapCenter.split(',').map((coordinate) => parseFloat(coordinate));

          // Navigate to the parsed coordinates
          instances.view.goTo({
            target: [split[0], split[1]],
            zoom: currScenario.zoom
          });

          // Create a map of layers from the current scenario to add to the map.
          const layers = currScenario.layers
            .map((l) => {
              return new FeatureLayer({
                url: l.url,
                title: l.info.name,
                id: Boolean(l.info.layerId) ? l.info.layerId : uuid(),
                opacity: 1 - parseInt((l.info.drawingInfo.transparency as unknown) as string, 10) / 100,
                listMode: 'show'
              });
            })
            .reverse();

          instances.map.addMany(layers);
        }, 0);
      }
    );
  }

  public ngOnDestroy() {
    this._$formReset.next();
    this._$formReset.complete();
    this._$destroy.next();
    this._$destroy.complete();
  }

  public async handleDrawSelection(e: esri.Graphic) {
    if (e.geometry) {
      this.form.controls.drawn.setValue(e);

      const layer = this.mapService.findLayerById('highwater-claims-layer') as esri.FeatureLayer;

      if (layer) {
        let query;

        try {
          query = await layer.queryFeatures({
            spatialRelationship: 'intersects',
            geometry: e.geometry,
            outFields: ['*']
          });

          this.selected.next(query.features);
        } catch (err) {
          console.error(err);
        }
      }
    } else {
      this.selected.next([]);
      this.form.controls.drawn.setValue(undefined);
    }
  }

  public scan(direction: 'next' | 'prev') {
    // Need to take a single emission, otherwise the response index value push will cause a
    forkJoin([this.responseIndex.pipe(take(1)), this.responses.pipe(take(1))]).subscribe(([index, responses]) => {
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
        if (index >= 0 && index + 1 <= responses.length - 2) {
          this.responseIndex.next(index + 1);
        } else if (index <= responses.length - 1 && this.form.valid) {
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
      if (this.drawComponent) {
        this.drawComponent.reset();
      }
      this.form.reset();
      this.initializeParticipant();
      this.responseIndex.next(-1);
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
  private updateOrCreateSubmission() {
    forkJoin([this.scenario.pipe(take(1)), this.responses.pipe(take(1))]).subscribe(([scenario, responses]) => {
      const parsed = (this.form.controls.drawn.value as esri.Graphic).toJSON();

      const submission: IResponseRequestPayload = {
        guid: this.participantGuid,
        name: this.form.controls.name.value,
        notes: this.form.controls.notes.value,
        shapes: parsed
      };

      const existing = responses.find((r) => r.guid === this.participantGuid);

      if (existing) {
        // If there is an existing submission for the current participant guid, replace its value with the new geometry.
        this.rs.updateResponse(submission.guid, submission).subscribe((updateStatus) => {
          this.responseSave.emit();
          console.log('Updated response');
        });
      } else {
        // If there is no existing submission for the current participant guid, add a dictionary index for the current
        // participant guid.
        submission.scenarioGuid = scenario.guid;
        submission.workshopGuid = this.route.snapshot.params['guid'];

        this.rs.createResponse(submission).subscribe((submissionStatus) => {
          this.responseSave.emit();
          console.log('Created response');
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

  /**
   * Manages the history of the ScenarioHistory behavior subject, to only keep a maximum of 2 entires (curr and prev).
   *
   * This history is used to add/remove layers for scenarios.
   */
  private addToScenarioHistory(scenario: IScenariosResponse) {
    const prevValue = this.scenarioHistory.getValue();

    const newValue = [...prevValue, scenario].slice(-2);

    this.scenarioHistory.next(newValue);
  }

  public scanScenario(direction: 'prev' | 'next') {
    forkJoin([this.scenarioIndex.pipe(take(1)), this.workshop]).subscribe(([scenarioIndex, workshop]) => {
      if (direction) {
        if (direction === 'prev') {
          if (scenarioIndex > 0) this.scenarioIndex.next(scenarioIndex - 1);
        } else if (direction === 'next') {
          this.scenarioIndex.next(scenarioIndex + 1);
        }
      }
    });
  }
}

interface IParticipantSubmission extends Omit<IResponseRequestPayload, 'shapes'> {
  shapes: esri.Graphic;
}
