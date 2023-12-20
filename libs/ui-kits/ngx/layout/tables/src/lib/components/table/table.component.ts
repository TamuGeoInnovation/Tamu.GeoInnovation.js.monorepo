import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { TableConfig } from '../../types/table.types';

@Component({
  selector: 'tamu-gisc-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent<T extends Record<string, unknown>> implements OnInit {
  @Input()
  public data: Array<T>;

  /**
   * Determines whether or not the table rows are actionable. If true, the row
   * click event will emit the object that was clicked and the cursor will be
   * set to a pointer.
   */
  @Input()
  public rowActionable = false;

  /**
   * Emits the object that was clicked on the row.
   *
   * Only emits if the `rowActionable` input is `true`.
   */
  @Output()
  public rowClick: EventEmitter<T> = new EventEmitter();

  public headers: Array<string>;

  /**
   * Configuration for the table. This is an array of objects that describe
   * the columns in the table.
   *
   * If no configuration is provided, the table will attempt to use the first
   * object in the data array to generate the configuration, which also implies
   * that every property will be displayed as a column.
   */
  @Input()
  public config: TableConfig;

  public ngOnInit(): void {
    if (!this.config) {
      this.config = this._generateConfig(this.data);
    }

    this.headers = this.config.map((c) => c.name);
  }

  /**
   * Emits the row click event with the provided object.
   */
  public emitRowClick(obj: T): void {
    if (this.rowActionable) {
      this.rowClick.emit(obj);
    }
  }

  /**
   * Generates a table configuration based on the first object in the data array.
   *
   * This is useful for when the config is not provided and the table columns
   * should be generated based on the data.
   */
  private _generateConfig(data: Array<T>): TableConfig {
    const first = data[0];

    const config: TableConfig = Object.keys(first).map((key) => {
      return {
        name: key,
        prop: key
      };
    });

    return config;
  }
}
