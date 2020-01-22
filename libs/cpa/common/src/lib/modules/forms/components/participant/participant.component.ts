import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, throttleTime, debounce, debounceTime } from 'rxjs/operators';

import * as uuid from 'uuid/v4';

import { LocalStoreService, StorageConfig } from '@tamu-gisc/common/ngx/local-store';
import { EsriMapService } from '@tamu-gisc/maps/esri';
import { getGeometryType } from '@tamu-gisc/common/utils/geometry/esri';
import { BaseDrawComponent } from '@tamu-gisc/maps/feature/draw';

import esri = __esri;

const storageConfig: StorageConfig = {
  primaryKey: 'ccpa',
  subKey: 'participants-submissions'
};

@Component({
  selector: 'tamu-gisc-participant',
  templateUrl: './participant.component.html',
  styleUrls: ['./participant.component.scss']
})
export class ParticipantComponent implements OnInit, OnDestroy {
  public form: FormGroup;

  public participantGuid: string;

  public state = {
    currentIndex: 0,
    limitSize: 0
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

  constructor(private fb: FormBuilder, private mapService: EsriMapService, private storage: LocalStoreService) {}

  public ngOnInit() {
    this.initializeParticipant();

    this.form = this.fb.group({
      name: ['', Validators.required],
      notes: ['', Validators.required],
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

  public scanParticipantEntry(direction: 'next' | 'prev') {
    const currentIndex = this.participantEntryIndex;

    if (direction === 'next') {
      // If the current guid has an entry index that is less than the total participant entries - 2,
      // meaning "there is at least one more non-placeholder participant entries in the array",
      // scan to that one.
      //
      // If the current guid has an entry index that is less than the total participant entries -1,
      // meaning "there are no more non-placeholder participant entries in the array", create a new
      // placeholder submission
      if (currentIndex <= this.participantEntries.length - 2) {
        this.resetWorkspace(this.participantEntryAtIndex(currentIndex + 1));
      } else if (currentIndex <= this.participantEntries.length - 1) {
        // Create a new participant placeholder
        this.resetWorkspace();
      }
    } else if (direction === 'prev') {
      // Cannot walk to an index less than 0
      if (currentIndex > 0) {
        // Reset to the previous non-placeholder entry.
        this.resetWorkspace(this.participantEntryAtIndex(currentIndex - 1));
      } else {
        // Reset to the last entry in the participants array. This block is hit whenever a new participant
        // is created but no value added to local store.
        this.resetWorkspace(this.participantEntryAtIndex(this.participantEntries.length - 1));
      }
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
          ...submission.graphic.geometry,
          type: getGeometryType(submission.graphic.geometry)
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
   * Gets a participant entry at a specific index.
   */
  private participantEntryAtIndex(index: number): IParticipantSubmission {
    const entries = this.participantEntries;

    if (index <= entries.length) {
      return entries[index];
    } else {
      console.log({ requested: index, limit: entries.length });
      throw new Error(`Requested index out of range.`);
    }
  }

  /**
   * Updates the entry value of the current participant guid with the provided geometry.
   */
  private updateParticipantLocalStore() {
    const parsed = (this.form.controls.drawn.value as esri.Graphic).toJSON();

    const submission: IParticipantSubmission = {
      guid: this.participantGuid,
      graphic: parsed,
      name: this.form.controls.name.value,
      notes: this.form.controls.notes.value
    };

    const existingValue = this.participantEntries;
    const existingIndex = this.participantEntryIndex;

    if (existingIndex > -1) {
      // If there is an existing submission for the current participant guid, replace its value with the new geometry.
      existingValue.splice(existingIndex, 1, submission);

      this.storage.setStorageObjectKeyValue({ ...storageConfig, value: existingValue });
    } else {
      // If there is no existing submission for the current participant guid, add a dictionary index for the current
      // participant guid.
      this.storage.setStorageObjectKeyValue({ ...storageConfig, value: [...existingValue, submission] });

      this.state.currentIndex = this.participantEntryIndex;
      this.state.limitSize = this.participantEntries.length;
    }
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
      this.state.currentIndex = this.participantEntryIndex;
      this.state.limitSize = this.participantEntries.length;
    }
  }
}

interface IParticipantSubmission {
  guid: string;
  graphic: esri.Graphic;
  name?: string;
  notes?: string;
}
