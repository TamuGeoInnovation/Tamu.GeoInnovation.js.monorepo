import { Component, Input, OnInit } from '@angular/core';

import { Speaker } from '@tamu-gisc/gisday/platform/data-api';

@Component({
  selector: 'tamu-gisc-speaker-card',
  templateUrl: './speaker-card.component.html',
  styleUrls: ['./speaker-card.component.scss']
})
export class SpeakerCardComponent implements OnInit {
  @Input()
  public speaker: Partial<Speaker>;

  public graduationYear: string;

  public ngOnInit(): void {
    this.graduationYear = this.speaker?.graduationYear ? this._truncateGraduationYear(this.speaker.graduationYear) : '';
  }

  private _truncateGraduationYear(year: string) {
    if (year.length === 4) {
      return `'${year.substring(2, 4)}`;
    } else if (year.length === 2) {
      return `' ${year}`;
    } else {
      return '';
    }
  }
}
