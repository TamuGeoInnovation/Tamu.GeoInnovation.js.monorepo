import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { InteractivePricingComponent } from '../../../core/modules/pricing/interactive-pricing.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'tamu-gisc-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [InteractivePricingComponent, RouterLink]
})
export class PricingComponent implements OnInit {
  private readonly env = inject(EnvironmentService);

  public url: string;

  public ngOnInit(): void {
    this.url = this.env.value('accounts_url');
  }
}
