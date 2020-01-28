import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subject, Observable, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, shareReplay, switchMap, pluck } from 'rxjs/operators';

import * as uuid from 'uuid/v4';
import { ResponseService } from '../../services/response.service';
import { WorkshopService } from '../../services/workshop.service';

import { IWorkshopRequestPayload, IResponseResponse, IResponseRequestPayload } from '@tamu-gisc/cpa/data-api';
import { LocalStoreService, StorageConfig } from '@tamu-gisc/common/ngx/local-store';
import { EsriMapService } from '@tamu-gisc/maps/esri';
import { getGeometryType } from '@tamu-gisc/common/utils/geometry/esri';
import { BaseDrawComponent } from '@tamu-gisc/maps/feature/draw';
import { IChartConfigurationOptions } from '@tamu-gisc/charts';

import esri = __esri;
import { ScenarioService } from '../../services/scenario.service';

const storageConfig: StorageConfig = {
  primaryKey: 'ccpa',
  subKey: 'participants-submissions'
};

@Component({
  selector: 'tamu-gisc-participant',
  templateUrl: './participant.component.html',
  styleUrls: ['./participant.component.scss'],
  providers: [ResponseService, WorkshopService, ScenarioService]
})
export class ParticipantComponent implements OnInit, OnDestroy {
  public workshop: Observable<IWorkshopRequestPayload>;
  public scenario: Observable<IResponseResponse>;
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
    private storage: LocalStoreService,
    private ws: WorkshopService,
    private rs: ResponseService,
    private ss: ScenarioService,
    private route: ActivatedRoute
  ) {}

  public ngOnInit() {
    this.initializeParticipant();

    this.form = this.fb.group({
      name: [''],
      notes: [''],
      drawn: [undefined, Validators.required]
    });

    this.form.statusChanges
      .pipe(
        takeUntil(this._$destroy),
        debounceTime(1000)
      )
      .subscribe((status) => {
        if (status === 'VALID') {
          console.log('updating');
          this.updateParticipantLocalStore();
        }
      });

    if (this.route.snapshot.params['guid']) {
      this.workshop = this.ws.getWorkshop(this.route.snapshot.params['guid']).pipe(shareReplay(1));

      this.scenario = this.workshop.pipe(
        pluck('scenarios'),
        pluck(this.scenarioIndex.value),
        shareReplay(1)
      );

      this.responses = combineLatest([this.workshop, this.scenario]).pipe(
        switchMap(([workshop, scenario]) => {
          return this.rs.getResponsesForWorkshopAndScenario(workshop.guid, scenario.guid);
        }),
        shareReplay(1)
      );

      // Reset the workspace with the response object at the responseIndex.
      this.responseIndex.pipe(switchMap((index) => this.responses.pipe(pluck(index)))).subscribe((res) => {
        if (res) {
          this.resetWorkspace((res as unknown) as IParticipantSubmission);
        }
      });
    }
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
    combineLatest([this.responseIndex, this.responses]).subscribe(([index, responses]) => {
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
      } else if (direction === 'next' && (index === -1 && this.form.valid)) {
        // If the current guid has an entry index that is less than the total participant entries - 2,
        // meaning "there is at least one more non-placeholder participant entries in the array",
        // scan to that one.
        //
        // If the current guid has an entry index that is less than the total participant entries -1,
        // meaning "there are no more non-placeholder participant entries in the array", create a new
        // placeholder submission
        if (index <= this.participantEntries.length - 2) {
          this.responseIndex.next(index + 1);
        } else if (index <= this.participantEntries.length - 1) {
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
   * Simple wrapper for local store call that returns the list of participant entries from local store.
   */
  private get participantEntries(): IParticipantSubmission[] {
    return this.storage.getStorageObjectKeyValue(storageConfig);
  }

  /**
   * Returns the entry index of the current participant guid.
   *
   * Returns `-1` if none found.
   */
  private get participantEntryIndex(): number {
    return this.participantEntries.findIndex((s) => s.guid === this.participantGuid);
  }

  /**
   * Updates the entry value of the current participant guid with the provided geometry.
   */
  private updateParticipantLocalStore() {
    this.scenario.subscribe((scenario) => {
      const parsed = (this.form.controls.drawn.value as esri.Graphic).toJSON();

      const submission: IResponseRequestPayload = {
        guid: this.participantGuid,
        shapes: parsed,
        name: this.form.controls.name.value,
        notes: this.form.controls.notes.value,
        workshopGuid: this.route.snapshot.params['guid'],
        scenarioGuid: scenario.guid
      };

      const existingValue = this.participantEntries;
      const existingIndex = this.participantEntryIndex;

      if (existingIndex > -1) {
        // If there is an existing submission for the current participant guid, replace its value with the new geometry.
        // existingValue.splice(existingIndex, 1, submission);
        // this.storage.setStorageObjectKeyValue({ ...storageConfig, value: existingValue });
      } else {
        // If there is no existing submission for the current participant guid, add a dictionary index for the current
        // participant guid.
        // this.storage.setStorageObjectKeyValue({ ...storageConfig, value: [...existingValue, submission] });

        this.rs.createResponse(submission).subscribe((submissionStatus) => {
          debugger;
        });

        // this.state.currentIndex = this.participantEntryIndex;
        // this.state.limitSize = this.participantEntries.length;
      }
    });
  }

  private initializeParticipant(guid?: string) {
    if (guid) {
      this.participantGuid = guid;
    } else {
      this.participantGuid = uuid();
    }

    // Initialize the local store for submission persistence
    if (this.participantEntries === undefined) {
      this.storage.setStorageObjectKeyValue({ ...storageConfig, value: [] });
    } else {
      // this.state.currentIndex = this.participantEntryIndex;
      // this.state.limitSize = this.participantEntries.length;
    }
  }
}

interface IParticipantSubmission extends Omit<IResponseRequestPayload, 'shapes'> {
  shapes: esri.Graphic;
}
