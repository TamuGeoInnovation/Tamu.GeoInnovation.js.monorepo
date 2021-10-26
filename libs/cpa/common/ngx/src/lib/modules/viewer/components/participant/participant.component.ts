import { Component, OnInit, ViewChild, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subject, forkJoin, interval, merge, Observable, ReplaySubject, from } from 'rxjs';
import {
  takeUntil,
  debounceTime,
  switchMap,
  map,
  take,
  throttle,
  filter,
  skip,
  shareReplay,
  tap,
  withLatestFrom
} from 'rxjs/operators';

import { IResponseRequestDto, IResponseDto } from '@tamu-gisc/cpa/data-api';
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
  public event = this.vs.snapshotOrScenario;
  public responses: Observable<IResponseDto[]>;
  public snapshotHistory = this.vs.snapshotHistory;

  public participantGuid = this.vs.updateParticipantGuid;
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
  @ViewChild(MapDrawAdvancedComponent, { static: false })
  private drawComponent: MapDrawAdvancedComponent;

  private _$destroy: Subject<boolean> = new Subject();

  constructor(
    private fb: FormBuilder,
    private rs: ResponseService,
    private mp: EsriModuleProviderService,
    private vs: ViewerService
  ) {}

  public ngOnInit() {
    this.form = this.fb.group({
      drawn: [undefined, Validators.required]
    });

    // On snapshot change, reset the workspace
    this.event.pipe(skip(1), takeUntil(this._$destroy)).subscribe((res) => {
      this.resetWorkspace();
    });

    // Fetch new responses from server whenever snapshot, or response save signal emits.
    this.responses = merge(this.event).pipe(
      // this.responses = merge(this.event, this.responseSave).pipe(
      switchMap((event) => {
        return forkJoin([this.workshop.pipe(take(1)), this.event.pipe(take(1))]);
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
      withLatestFrom(this.vs.participantGuid),
      map(([responses, participantGuid]) => {
        return responses.filter((r) => r.participant && r.participant.guid === participantGuid);
      }),
      shareReplay(1)
    );

    // Reset workspace whenever there is a new set of responses from the server
    // or when there is a workshop event change (snapshot or scenario).
    this.responses
      .pipe(
        switchMap((response) => {
          return from(response);
        }),
        takeUntil(this._$destroy)
      )
      .subscribe((res) => {
        if (res) {
          this.resetWorkspace(res as IParticipantSubmission);
        }
      });

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
        debounceTime(1000),
        filter((status) => {
          return status === 'VALID';
        }),
        tap((s) => {
          this.saveStatus.next(SAVE_STATUS.Saving);
        }),
        takeUntil(this._$destroy)
      )
      .subscribe((status) => {
        this._updateOrCreateSubmission();
      });

    // This is the path of least resistance to save graphic notes. The popup communicates with the service
    // and this component listens for those events which triggers a response submission save.
    this.vs.save.pipe(takeUntil(this._$destroy)).subscribe(() => {
      this._updateOrCreateSubmission();
    });
  }

  public ngOnDestroy() {
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
    } else {
      this.mp.require(['Graphic', 'Symbol', 'Geometry']).then(([Graphic]: [esri.GraphicConstructor]) => {
        this.drawComponent.reset();
        // Create an auto-castable graphic.
        const graphics = submission.shapes.map((s) => {
          return Graphic.fromJSON(s);
        });

        // Draws submission graphics to the draw component target layer.
        this.drawComponent.draw(graphics);
      });
    }
  }

  /**
   * Updates the entry value of the current participant guid with the provided geometry.
   */
  private _updateOrCreateSubmission() {
    forkJoin([this.event.pipe(take(1)), this.responses.pipe(take(1)), this.vs.participantGuid.pipe(take(1))]).subscribe(
      ([snapshot, responses, participantGuid]) => {
        const parsed = (this.form.controls.drawn.value as Array<esri.Graphic>).map((graphic) => {
          return graphic.toJSON();
        });

        // TODO: This is currently an array but needs to be reformatted to treat as a single response
        // This is because there will be a single participant response the current workshop and snapshot/scenario event
        if (responses.length > 0) {
          // If there is an existing response, replace its value with the new geometry.

          const submission: IResponseRequestDto = {
            guid: responses[0].guid,
            shapes: parsed
          };

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
          // TODO: Remove notes and name property from response entity
          const submission: IResponseRequestDto = {
            participantGuid: participantGuid,
            shapes: parsed
          };

          this.event.pipe(take(1), withLatestFrom(this.workshop)).subscribe(([snapShotOrScenario, workshop]) => {
            if (snapShotOrScenario.type === 'scenario') {
              submission.scenarioGuid = snapshot.guid;
            } else {
              submission.snapshotGuid = snapshot.guid;
            }

            submission.workshopGuid = workshop.guid;

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
      }
    );
  }
}

interface IParticipantSubmission extends Omit<IResponseRequestDto, 'shapes'> {
  shapes: esri.Graphic[];
}

enum SAVE_STATUS {
  Pending = 0,
  Saving = 1,
  Complete = 2,
  Error = 3
}
