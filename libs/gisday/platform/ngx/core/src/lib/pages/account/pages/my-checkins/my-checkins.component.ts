import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { Observable, shareReplay } from 'rxjs';

import { CheckinService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { CheckIn } from '@tamu-gisc/gisday/platform/data-api';
import { AsyncPipe, DatePipe } from '@angular/common';

@Component({
    selector: 'tamu-gisc-my-checkins',
    templateUrl: './my-checkins.component.html',
    styleUrls: ['./my-checkins.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [AsyncPipe, DatePipe]
})
export class MyCheckinsComponent implements OnInit {
  public checkins$: Observable<Array<Partial<CheckIn>>>;

  constructor(private readonly checkinService: CheckinService) {}

  public ngOnInit() {
    this.checkins$ = this.checkinService.getUserCheckins().pipe(shareReplay());
  }
}
