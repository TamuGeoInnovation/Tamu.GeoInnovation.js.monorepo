import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { AddressProcessingAdvancedComponent } from '../../../../../../../core/modules/interactive/components/address-processing/advanced/address-processing-advanced/address-processing-advanced.component';

@Component({
    selector: 'tamu-gisc-interactive',
    templateUrl: './interactive.component.html',
    styleUrls: ['./interactive.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [AddressProcessingAdvancedComponent]
})
export class InteractiveComponent implements OnInit {
  public url: string;

  constructor(private readonly env: EnvironmentService) {}

  public ngOnInit() {
    this.url = this.env.value('accounts_url');
  }
}
