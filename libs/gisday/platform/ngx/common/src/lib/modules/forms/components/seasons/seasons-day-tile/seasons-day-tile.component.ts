import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';

import { DlDateTimePickerChange } from 'angular-bootstrap-datetimepicker';

import { SeasonDay } from '@tamu-gisc/gisday/platform/data-api';

@Component({
  selector: 'tamu-gisc-seasons-day-tile',
  templateUrl: './seasons-day-tile.component.html',
  styleUrls: ['./seasons-day-tile.component.scss']
})
export class SeasonsDayTileComponent {
  @Input()
  public day: Partial<SeasonDay> = null;

  /**
   * Determines whether the tile is interactive or not. Interactivity defines its
   * ability to update the date value.
   *
   * When `false`, the component will simply display the date value and will not
   * emit any added, delete, or updated events.
   */
  @Input()
  public interactive = true;

  @Output()
  public added: EventEmitter<boolean> = new EventEmitter();

  @Output()
  public deleted: EventEmitter<Partial<SeasonDay>> = new EventEmitter();

  @Output()
  public updated: EventEmitter<Partial<SeasonDay>> = new EventEmitter();

  @HostBinding('class')
  public get cssClasses() {
    return this.interactive ? 'interactive' : 'non-interactive';
  }

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
    if (this.interactive !== false) {
      this.updated.emit({
        guid: this.day.guid,
        date: event.value
      });
    }
  }

  /**
   * Emit event to notify parent to handle deleting the emitted day
   */
  public delete() {
    if (this.interactive !== false) {
      this.deleted.emit({
        guid: this.day.guid,
        date: this.day.date
      });
    }
  }
}

