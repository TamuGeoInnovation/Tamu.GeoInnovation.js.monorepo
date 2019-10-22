import { Component } from '@angular/core';

/**
 * @title Basic DateTime Picker
 */
@Component({
  selector: 'date-picker',
  styleUrls: ['./date.component.scss'],
  templateUrl: 'date.component.html'
})
export class DateRange {
  public selectedMoments = [new Date(2018, 1, 12, 10, 30), new Date(2018, 3, 21, 20, 30)];
}
