import { Component, Input } from '@angular/core';

import { ITransactionData } from '@tamu-gisc/geoprocessing-v5';

@Component({
  selector: 'tamu-gisc-status-result-table',
  templateUrl: './status-result-table.component.html',
  styleUrls: ['./status-result-table.component.scss']
})
export class StatusResultTableComponent {
  @Input()
  public status: ITransactionData<unknown, unknown>;
}

