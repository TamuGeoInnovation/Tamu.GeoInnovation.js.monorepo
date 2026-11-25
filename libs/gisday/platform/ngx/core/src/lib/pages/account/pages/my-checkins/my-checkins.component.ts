import { Component, OnInit, inject } from '@angular/core';

import { Observable, shareReplay } from 'rxjs';

import { CheckinService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { CheckIn } from '@tamu-gisc/gisday/platform/data-api';
import { AsyncPipe } from '@angular/common';
import { CentralDatePipe } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-my-checkins',
  templateUrl: './my-checkins.component.html',
  styleUrls: ['./my-checkins.component.scss'],
  imports: [AsyncPipe, CentralDatePipe]
})
export class MyCheckinsComponent implements OnInit {
  private readonly checkinService = inject(CheckinService);

  public checkins$: Observable<Array<Partial<CheckIn>>>;

  public ngOnInit() {
    this.checkins$ = this.checkinService.getUserCheckins().pipe(shareReplay());
  }
}
