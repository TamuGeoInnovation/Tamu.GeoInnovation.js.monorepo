import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';

@Component({
  selector: 'tamu-gisc-sponsors-tamu',
  templateUrl: './sponsors-tamu.component.html',
  styleUrls: ['./sponsors-tamu.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink]
})
export class SponsorsTamuComponent implements OnInit {
  /**
   * On a phone the level cards say "reps" for "representatives", so five fit two to a row (#1976).
   */
  public readonly isMobile = toSignal(inject(ResponsiveService).isMobile, { initialValue: false });

  public ngOnInit(): void {
    this.changeRank('point');
  }

  public changeRank(rank: string) {
    this.clearAllOtherPlaques();
    this.setPlaqueVisibleStatus(rank);
    this.scrollToSponsorOpportunities();
  }

  public clearAllOtherPlaques() {
    document.querySelectorAll('.plaque').forEach((elem) => {
      elem.classList.remove('active');
    });

    document.querySelectorAll('.content-block').forEach((elem) => {
      elem.classList.remove('visible');
    });
  }

  public setPlaqueVisibleStatus(rank: string) {
    const plaque = document.querySelector(`[rank=${rank}]`);
    const content = document.querySelector(`.content-block[rank=${rank}]`);

    if (plaque) {
      plaque.classList.add('active');
    }

    if (content) {
      content.classList.add('visible');
    }
  }

  public scrollToSponsorOpportunities() {
    const element = document.getElementById('sponsor-opportunities');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
