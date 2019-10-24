import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'date-picker',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateComponent implements OnInit {
  public dateTimeRange: Date[];

  constructor() {}

  public ngOnInit() {}
}
