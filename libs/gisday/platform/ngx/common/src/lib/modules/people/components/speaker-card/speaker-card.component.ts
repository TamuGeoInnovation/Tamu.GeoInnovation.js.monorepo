import { Component, Input } from '@angular/core';

import { Speaker } from '@tamu-gisc/gisday/platform/data-api';

@Component({
  selector: 'tamu-gisc-speaker-card',
  templateUrl: './speaker-card.component.html',
  styleUrls: ['./speaker-card.component.scss']
})
export class SpeakerCardComponent {
  @Input()
  public speaker: Partial<Speaker>;
}

