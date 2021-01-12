import { Component, OnInit } from '@angular/core';
import { CheckinService } from '@tamu-gisc/gisday/data-access';
import { CheckIn } from '@tamu-gisc/gisday/data-api';
import { Observable } from 'rxjs';

@Component({
  selector: 'tamu-gisc-my-checkins',
  templateUrl: './my-checkins.component.html',
  styleUrls: ['./my-checkins.component.scss']
})
export class MyCheckinsComponent implements OnInit {
  public $checkins: Observable<Array<Partial<CheckIn>>>;
  constructor(private readonly checkinService: CheckinService) {}

  public ngOnInit(): void {
    this.fetchCheckins();
  }

  public fetchCheckins() {
    this.$checkins = this.checkinService.getEntities();
  }
}
