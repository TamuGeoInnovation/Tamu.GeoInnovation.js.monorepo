import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { RouterLink } from '@angular/router';
import { CensusIntersectionAdvancedComponent } from '../../../../../../../core/modules/interactive/components/census-intersection/advanced/census-intersection-advanced/census-intersection-advanced.component';

@Component({
  selector: 'tamu-gisc-interactive',
  templateUrl: './interactive.component.html',
  styleUrls: ['./interactive.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, CensusIntersectionAdvancedComponent]
})
export class InteractiveComponent implements OnInit {
  private readonly env = inject(EnvironmentService);

  public url: string;

  public ngOnInit() {
    this.url = this.env.value('accounts_url');
  }
}
