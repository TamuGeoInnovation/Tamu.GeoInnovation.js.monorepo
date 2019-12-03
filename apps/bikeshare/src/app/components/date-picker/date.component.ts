import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { LayerListService } from '@tamu-gisc/maps/feature/layer-list';

@Component({
  selector: 'tamu-gisc-date-picker',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateRange implements OnInit {
  public dateTimeRange: Date[];

  // Max date allowed by the date picker
  // Currently set to Nov 21, 2019 as the last day with trip data
  public max = new Date(2019, 10, 21);

  constructor(private layerListService: LayerListService) {}
  //constructor() {}

  public ngOnInit() {
    // Default Dates = last 24h to now
    //const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    //this.dateTimeRange = [yesterday, new Date()];
    this.dateTimeRange = [new Date(2019, 10, 20), new Date(2019, 10, 21)];
  }

  // Called when datePicker is closed
  // Sends the dates to the layer service
  public newDate() {
    this.layerListService.changeDate(this.dateTimeRange);
  }
}
