import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { Speaker } from '@tamu-gisc/gisday/platform/data-api';
import { RouterLink } from '@angular/router';
import { NgStyle } from '@angular/common';
import { SpeakerAvatarComponent } from '../speaker-avatar/speaker-avatar.component';

@Component({
  selector: 'tamu-gisc-speaker-card',
  templateUrl: './speaker-card.component.html',
  styleUrls: ['./speaker-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, NgStyle, SpeakerAvatarComponent]
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
