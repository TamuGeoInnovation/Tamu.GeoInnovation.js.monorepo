import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'date-picker',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateComponent implements OnInit {
  public dateTimeRange: Date[];

  constructor() {}

  public ngOnInit() {
    const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    this.dateTimeRange = [yesterday, new Date()];
  }
}
