import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

import { DlDateTimePickerChange } from 'angular-bootstrap-datetimepicker';

import { SeasonDay } from '@tamu-gisc/gisday/platform/data-api';

@Component({
  selector: 'tamu-gisc-seasons-day-tile',
  templateUrl: './seasons-day-tile.component.html',
  styleUrls: ['./seasons-day-tile.component.scss']
})
export class SeasonsDayTileComponent {
  @Input()
  public day: FormControl = null;

  @Output()
  public added: EventEmitter<boolean> = new EventEmitter();

  @Output()
  public deleted: EventEmitter<Partial<SeasonDay>> = new EventEmitter();

  @Output()
  public updated: EventEmitter<Partial<SeasonDay>> = new EventEmitter();

  /**
   * Emit event to notify parent to handle adding another day.
   */
  public add() {
    this.added.emit(true);
  }

  /**
   * Emit event to notify parent to handle updating the emitted day
   */
  public update(event: DlDateTimePickerChange<Date>) {
    this.updated.emit({
      guid: this.day.value.guid,
      date: event.value
    });
  }

  /**
   * Emit event to notify parent to handle deleting the emitted day
   */
  public delete() {
    this.deleted.emit({
      guid: this.day.value.guid,
      date: this.day.value.date
    });
  }
}

