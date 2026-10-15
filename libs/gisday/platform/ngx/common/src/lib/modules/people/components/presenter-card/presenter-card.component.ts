import { Component, OnInit, ChangeDetectionStrategy, computed, input, output } from '@angular/core';

import { Speaker } from '@tamu-gisc/gisday/platform/data-api';
import { SpeakerAvatarComponent } from '../speaker-avatar/speaker-avatar.component';
import { RouterLink } from '@angular/router';
import { isAggieFormerStudent, shortClassYear, speakerAffiliation } from '../../../../utils/speakers';

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

  public readonly delete = output<void>();

  public speakerInitials: string;

  /**
   * A Texas A&M former student's class year, written after their name (Benjamin Lybrand '14), and
   * empty for anyone else (#1768).
   */
  public readonly classYear = computed(() =>
    isAggieFormerStudent(this.speaker()) ? shortClassYear(this.speaker().graduationYear) : ''
  );

  /**
   * The company or organization the speaker is with, shown under their name (#1768).
   */
  public readonly affiliation = computed(() => speakerAffiliation(this.speaker()));

  public ngOnInit(): void {
    this.speakerInitials = this.speaker()?.firstName[0] + this.speaker()?.lastName[0];
  }

  public emitAction(action: string): void {
    if (action === 'delete') {
      this.delete.emit();
    }
  }
}
