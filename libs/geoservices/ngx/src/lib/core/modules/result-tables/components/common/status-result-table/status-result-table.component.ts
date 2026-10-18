import { Component, input } from '@angular/core';

import { ITransactionData } from '@tamu-gisc/geoprocessing-v5';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-status-result-table',
  templateUrl: './status-result-table.component.html',
  styleUrls: ['./status-result-table.component.scss'],
  imports: [DecimalPipe]
})
export class StatusResultTableComponent {
  public readonly status = input<ITransactionData<unknown, unknown>>(undefined);
}
