import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgStyle } from '@angular/common';

import { Speaker } from '@tamu-gisc/gisday/platform/data-api';

import { shortClassYear } from '../../../../utils/speakers';

/**
 * The corner banner on a presenter's photograph: the university they attended and their class year,
 * in that university's colour. Renders nothing for a presenter without both.
 *
 * It is positioned by whatever holds the photograph (the presenter card, the presenter page), so the
 * banner's size and offset live with those in the app's stylesheet, as they did before this was shared.
 */
@Component({
  selector: 'tamu-gisc-speaker-class-banner',
  templateUrl: './speaker-class-banner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgStyle]
})
export class SpeakerClassBannerComponent {
  public readonly speaker = input<Partial<Speaker>>();

  public readonly acronym = computed(() => this.speaker()?.university?.acronym);
  public readonly background = computed(() => `#${this.speaker()?.university?.hexTriplet}`);
  public readonly classYear = computed(() => shortClassYear(this.speaker()?.graduationYear));

  // An empty string, not a missing year, is what hides the banner: a presenter with a university and no
  // year recorded still shows the university alone, as the card always has.
  public readonly visible = computed(() => Boolean(this.acronym()) && this.speaker()?.graduationYear !== '');
}
