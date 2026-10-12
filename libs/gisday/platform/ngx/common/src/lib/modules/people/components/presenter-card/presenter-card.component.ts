import { Component, EventEmitter, OnInit, Output, ChangeDetectionStrategy, input } from '@angular/core';

import { Speaker } from '@tamu-gisc/gisday/platform/data-api';
import { SpeakerAvatarComponent } from '../speaker-avatar/speaker-avatar.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'tamu-gisc-presenter-card',
  templateUrl: './presenter-card.component.html',
  styleUrls: ['./presenter-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SpeakerAvatarComponent, RouterLink]
})
export class PresenterCardComponent implements OnInit {
  public readonly speaker = input<Partial<Speaker>>(undefined);

  public readonly linkable = input(true);

  public readonly showActions = input(false);

  @Output()
  public delete: EventEmitter<void> = new EventEmitter();

  public speakerInitials: string;

  public ngOnInit(): void {
    this.speakerInitials = this.speaker()?.firstName[0] + this.speaker()?.lastName[0];
  }

  public emitAction(action: string): void {
    if (action === 'delete') {
      this.delete.emit();
    }
  }
}
