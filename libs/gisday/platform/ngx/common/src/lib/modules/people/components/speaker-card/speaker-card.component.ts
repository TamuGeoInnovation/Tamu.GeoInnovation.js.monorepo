import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { Speaker } from '@tamu-gisc/gisday/platform/data-api';
import { RouterLink } from '@angular/router';
import { SpeakerAvatarComponent } from '../speaker-avatar/speaker-avatar.component';
import { SpeakerClassBannerComponent } from '../speaker-class-banner/speaker-class-banner.component';

@Component({
  selector: 'tamu-gisc-speaker-card',
  templateUrl: './speaker-card.component.html',
  styleUrls: ['./speaker-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, SpeakerAvatarComponent, SpeakerClassBannerComponent]
})
export class SpeakerCardComponent {
  @Input()
  public speaker: Partial<Speaker>;
}
