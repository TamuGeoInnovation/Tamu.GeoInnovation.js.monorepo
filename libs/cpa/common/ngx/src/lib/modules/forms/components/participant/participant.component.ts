import { Component, OnInit, ViewChild, OnDestroy, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subject, forkJoin, interval, of, combineLatest, from, merge, Observable } from 'rxjs';
import {
  takeUntil,
  debounceTime,
  switchMap,
  take,
  throttle,
  withLatestFrom,
  filter,
  skip,
  shareReplay
} from 'rxjs/operators';

import { v4 as guid } from 'uuid';

import { IResponseRequestPayload, IResponseResponse } from '@tamu-gisc/cpa/data-api';
import { EsriMapService, EsriModuleProviderService, MapServiceInstance } from '@tamu-gisc/maps/esri';
import { BaseDrawComponent } from '@tamu-gisc/maps/feature/draw';
import { WorkshopService, ResponseService, ScenarioService } from '@tamu-gisc/cpa/data-access';

import { TypedSnapshotOrScenario, ViewerService } from '../../../viewer/services/viewer.service';

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

  // Values managed by service
  public workshop = this.vs.workshop;
  public snapshot = this.vs.snapshotOrScenario;
  public responses: Observable<IResponseResponse[]>;
  public snapshotHistory = this.vs.snapshotHistory;
  public selectionIndex = this.vs.selectionIndex;

  // Values specific to the participant component.
  public responseIndex: BehaviorSubject<number> = new BehaviorSubject(-1);
  public participantGuid: string;
  public form: FormGroup;

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
    private rs: ResponseService,
    private route: ActivatedRoute,
    private ms: EsriMapService,
    private mp: EsriModuleProviderService,
    private vs: ViewerService,
    private sc: ScenarioService
  ) {}

  public ngOnInit() {
    this.initializeParticipant();

    this.form = this.fb.group({
      name: [''],
      notes: [''],
      drawn: [undefined, Validators.required]
    });

    if (this.route.snapshot.params['guid']) {
      this.vs.updateWorkshopGuid(this.route.snapshot.params.guid);

      // On snapshot change, reset the workspace
      this.snapshot.pipe(skip(1), takeUntil(this._$destroy)).subscribe((res) => {
        this.resetWorkspace();
      });

      // Fetch new responses from server whenever snapshot, response index, or response save signal emits.
      this.responses = merge(this.snapshot, this.responseIndex, this.responseSave).pipe(
        switchMap((event) => {
          return forkJoin([this.workshop.pipe(take(1)), this.snapshot.pipe(take(1))]);
        }),
        switchMap(([workshop, snapshot]) => {
          return this.rs.getResponsesForWorkshopAndSnapshot(workshop.guid, snapshot.guid);
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
            throttle(() => interval(700)),
            debounceTime(750),
            takeUntil(this._$formReset)
          )
          .subscribe((status) => {
            if (status === 'VALID') {
              this.updateOrCreateSubmission();
            }
          });
      });
    }

    // Use SnapshotHistory observable to determine a snapshot change which requires the addition of new layers
    // and/or removal of old snapshot layers
    combineLatest([
      this.snapshotHistory,
      this.ms.store,
      from(this.mp.require(['FeatureLayer', 'GraphicsLayer', 'Graphic']))
    ]).subscribe(
      ([snapshotHistory, instances, [FeatureLayer, GraphicsLayer, Graphic]]: [
        TypedSnapshotOrScenario[],
        MapServiceInstance,
        [esri.FeatureLayerConstructor, esri.GraphicsLayerConstructor, esri.GraphicConstructor]
      ]) => {
        // Find any layers associated with the current snapshot and clear them to prepare to add layers from the next snapshot
        const prevSnapshot = snapshotHistory.length > 1 ? snapshotHistory[0] : undefined;
        const currSnapshot = snapshotHistory.length > 1 ? snapshotHistory[1] : snapshotHistory[0];

        if (!currSnapshot) {
          return;
        }

        if (prevSnapshot) {
          const prevLayers = prevSnapshot.layers
            .map((l) => {
              return instances.map.layers.find((ml) => {
                // Find layer ID from either a snapshot guid array, or the actual layer object id
                const layerid = typeof l === 'string' ? l : l.info.layerId;

                return ml.id === layerid;
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
          // Parse coordinates form snapshot string definition
          const split = currSnapshot.mapCenter.split(',').map((coordinate) => parseFloat(coordinate));

          // Navigate to the parsed coordinates
          instances.view.goTo({
            target: [split[0], split[1]],
            zoom: currSnapshot.zoom
          });

          if (currSnapshot.type === 'scenario') {
            this.getLayerForScenarioGuid(currSnapshot.guid)
              .then((layer) => {
                const layers = layer.layers
                  .map((l) => {
                    const g = l.graphics.map((g) => {
                      return Graphic.fromJSON(g);
                    });

                    return new GraphicsLayer({
                      title: l.info.name,
                      id: l.info.layerId,
                      graphics: g,
                      listMode: 'show'
                    });
                  })
                  .reverse();

                instances.map.addMany(layers);
              })
              .catch((err) => {
                throw new Error(err);
              });
          } else {
            // Create a map of layers from the current snapshot to add to the map.
            const layers = currSnapshot.layers
              .map((l) => {
                return new FeatureLayer({
                  url: l.url,
                  title: l.info.name,
                  id: l.info.layerId,
                  opacity: 1 - parseInt((l.info.drawingInfo.transparency as unknown) as string, 10) / 100,
                  listMode: 'show'
                });
              })
              .reverse();

            instances.map.addMany(layers);
          }
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

  public getLayerForScenarioGuid(scenarioGuid: string) {
    return this.sc.getLayerForScenario(scenarioGuid).toPromise();
  }

  public async handleDrawSelection(e: Array<esri.Graphic>) {
    // Test if all drawn features have geometry
    const allHaveGeometry = e.every((g) => g.geometry !== undefined);

    if (e.length > 0 && allHaveGeometry) {
      this.form.controls.drawn.setValue(e);
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
        if (index >= 0 && index + 1 <= responses.length - 1) {
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
      this.mp.require(['Graphic', 'Symbol', 'Geometry']).then(([Graphic]: [esri.GraphicConstructor]) => {
        this.drawComponent.reset();
        // Create an auto-castable graphic.
        const graphics = submission.shapes.map((s) => {
          return Graphic.fromJSON(s);
        });

        // Set/Overwrite form values
        this.form.patchValue({
          name: submission.name,
          notes: submission.notes
        });

        // Draws submission graphics to the draw component target layer.
        this.drawComponent.draw(graphics);

        // Set the component participant state.
        this.initializeParticipant(submission.guid);
      });
    }
  }

  /**
   * Updates the entry value of the current participant guid with the provided geometry.
   */
  private updateOrCreateSubmission() {
    forkJoin([this.snapshot.pipe(take(1)), this.responses.pipe(take(1))]).subscribe(([snapshot, responses]) => {
      const parsed = (this.form.controls.drawn.value as Array<esri.Graphic>).map((graphic) => {
        return graphic.toJSON();
      });

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
        submission.snapshotGuid = snapshot.guid;
        submission.workshopGuid = this.route.snapshot.params['guid'];

        this.rs.createResponse(submission).subscribe((submissionStatus) => {
          this.responseSave.emit();
          console.log('Created response');
        });
      }
    });
  }

  private initializeParticipant(id?: string) {
    if (id) {
      this.participantGuid = id;
    } else {
      this.participantGuid = guid();
    }
  }
}

interface IParticipantSubmission extends Omit<IResponseRequestPayload, 'shapes'> {
  shapes: esri.Graphic[];
}
