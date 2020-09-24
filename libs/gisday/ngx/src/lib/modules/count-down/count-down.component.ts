import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import FlipClock from 'flipclock';

@Component({
  selector: 'tamu-gisc-count-down',
  templateUrl: './count-down.component.html',
  styleUrls: ['./count-down.component.scss']
})
export class CountDownComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    document.onreadystatechange = (ev) => {
      const start = Date.parse('18 Nov 2020 09:00:00 GMT-6');
      const now = Date.now();
      const flipClockEl = document.querySelector('.flipclock');
      const flipClock = new FlipClock(flipClockEl, (start - now) / 1000, {
        clockFace: 'DailyCounter',
        countDown: true
      });
    };
  }
}
