import { Component, OnInit } from '@angular/core';
import { CheckIn } from '@tamu-gisc/gisday/data-api';
import { Observable } from 'rxjs';

@Component({
  selector: 'tamu-gisc-my-checkins',
  templateUrl: './my-checkins.component.html',
  styleUrls: ['./my-checkins.component.scss']
})
export class MyCheckinsComponent implements OnInit {
  public $checkins: Observable<Array<Partial<CheckIn>>>;
  constructor() {}

  ngOnInit(): void {}
}
