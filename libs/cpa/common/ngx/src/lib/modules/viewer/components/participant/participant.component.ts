import { Component, OnInit, ViewChild, OnDestroy, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subject, forkJoin, interval, of, merge, Observable, ReplaySubject } from 'rxjs';
import {
  takeUntil,
  debounceTime,
  switchMap,
  map,
  take,
  throttle,
  withLatestFrom,
  filter,
  skip,
  shareReplay,
  tap,
  pluck
} from 'rxjs/operators';

import { v4 as guid } from 'uuid';

import { IResponseRequestPayload, IResponseResponse } from '@tamu-gisc/cpa/data-api';
import { EsriModuleProviderService } from '@tamu-gisc/maps/esri';
import { MapDrawAdvancedComponent } from '@tamu-gisc/maps/feature/draw';
import { ResponseService } from '@tamu-gisc/cpa/data-access';

import { ViewerService } from '../../../viewer/services/viewer.service';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-participant',
  templateUrl: './participant.component.html',
  styleUrls: ['./participant.component.scss']
})
export class ParticipantComponent implements OnInit, OnDestroy {
  @Output()
  public responseSave: EventEmitter<boolean> = new EventEmitter();

  // Values managed by service
  public workshop = this.vs.workshop;
  public snapshot = this.vs.snapshotOrScenario;
  public responses: Observable<IResponseResponse[]>;
  public snapshotHistory = this.vs.snapshotHistory;

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

  public saveStatus: ReplaySubject<SAVE_STATUS> = new ReplaySubject(1);

  /**
   * Map draw component reference.
   *
   * Needed to call its public `draw` and `reset` methods.
   */
  @ViewChild(MapDrawAdvancedComponent, { static: true })
  private drawComponent: MapDrawAdvancedComponent;

  private _$formReset: Subject<boolean> = new Subject();
  private _$destroy: Subject<boolean> = new Subject();

  constructor(
    private fb: FormBuilder,
    private rs: ResponseService,
    private route: ActivatedRoute,
    private mp: EsriModuleProviderService,
    private vs: ViewerService
  ) {}

  public ngOnInit() {
    this._initializeParticipant();

    this.form = this.fb.group({
      name: [''],
      notes: [''],
      drawn: [undefined, Validators.required]
    });

    if (this.route.snapshot.queryParams['workshop']) {
      this.vs.updateWorkshopGuid(this.route.snapshot.queryParams.workshop);

      // On snapshot change, reset the workspace
      this.snapshot.pipe(skip(1), takeUntil(this._$destroy)).subscribe((res) => {
        this.resetWorkspace();
      });

      // Setup a route params listener to change the snapshot as a result of a the navigator component
      // emitting a selection event and also automatically select an snapshot or scenario when the application
      // loads and there is an eventGuid in the route params
      this.route.queryParams
        .pipe(
          pluck('event'),
          filter((eg) => eg !== null || eg !== undefined),
          takeUntil(this._$destroy)
        )
        .subscribe((res) => {
          this.vs.updateSelectionIndex(res);
        });

      // Fetch new responses from server whenever snapshot, response index, or response save signal emits.
      this.responses = merge(this.snapshot, this.responseIndex, this.responseSave).pipe(
        switchMap((event) => {
          return forkJoin([this.workshop.pipe(take(1)), this.snapshot.pipe(take(1))]);
        }),
        switchMap(([workshop, snapshotOrScenario]) => {
          if (snapshotOrScenario?.type === 'snapshot') {
            return this.rs.getResponsesForWorkshopAndSnapshot(workshop.guid, snapshotOrScenario.guid);
          } else if (snapshotOrScenario.type === 'scenario') {
            return this.rs.getResponsesForWorkshop(workshop.guid).pipe(
              map((responses) => {
                return responses.filter((response) => {
                  if (response.scenario) {
                    return response;
                  }
                });
              })
            );
          } else {
            const message = 'snapshotOrScenario without type';
            console.warn(message);
            throw Error(message);
          }
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
            // Ignore the form value patch event. 500ms should always be a long
            // enough interval to ignore, after which we want to capture and debounce
            // all form value changes.
            throttle(() => interval(500)),
            tap((s) => {
              // If the form is invalid the it is due to the a form value patch
              // from a submission change.
              if (s === 'VALID') {
                this.saveStatus.next(SAVE_STATUS.Pending);
              }
            }),
            debounceTime(3000),
            filter((status) => {
              return status === 'VALID';
            }),
            tap((s) => {
              this.saveStatus.next(SAVE_STATUS.Saving);
            }),
            takeUntil(this._$formReset)
          )
          .subscribe((status) => {
            this._updateOrCreateSubmission();
          });
      });
    }
  }

  public ngOnDestroy() {
    this._$formReset.next();
    this._$formReset.complete();
    this._$destroy.next();
    this._$destroy.complete();
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
      this._initializeParticipant();
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
        this._initializeParticipant(submission.guid);
      });
    }
  }

  /**
   * Updates the entry value of the current participant guid with the provided geometry.
   */
  private _updateOrCreateSubmission() {
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
        this.rs.updateResponse(submission.guid, submission).subscribe(
          (updateStatus) => {
            this.responseSave.emit();
            this.saveStatus.next(SAVE_STATUS.Complete);
            console.log('Updated response');
          },
          (err) => {
            this.saveStatus.next(SAVE_STATUS.Error);
          }
        );
      } else {
        // If there is no existing submission for the current participant guid, add a dictionary index for the current
        // participant guid.
        this.snapshot.pipe(take(1)).subscribe((snapShotOrScenario) => {
          if (snapShotOrScenario.type === 'scenario') {
            submission.scenarioGuid = snapshot.guid;
          } else {
            submission.snapshotGuid = snapshot.guid;
          }
          submission.workshopGuid = this.route.snapshot.queryParams['workshop'];
          this.rs.createResponse(submission).subscribe(
            (submissionStatus) => {
              this.responseSave.emit();
              this.saveStatus.next(SAVE_STATUS.Complete);
              console.log('Created response');
            },
            (err) => {
              this.saveStatus.next(SAVE_STATUS.Error);
            }
          );
        });
      }
    });
  }

  /**
   * Sets the participant ID to be a provided one or generates one if not provided.
   */
  private _initializeParticipant(id?: string) {
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

enum SAVE_STATUS {
  Pending = 0,
  Saving = 1,
  Complete = 2,
  Error = 3
}
