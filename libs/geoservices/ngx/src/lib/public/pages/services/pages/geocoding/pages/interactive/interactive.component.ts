import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { GeocodingAdvancedComponent } from '../../../../../../../core/modules/interactive/components/geocoding/advanced/geocoding-advanced/geocoding-advanced.component';

@Component({
    selector: 'tamu-gisc-interactive',
    templateUrl: './interactive.component.html',
    styleUrls: ['./interactive.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [GeocodingAdvancedComponent]
})
export class InteractiveComponent implements OnInit {
  public url: string;

  constructor(private readonly env: EnvironmentService) {}

  public ngOnInit() {
    this.url = this.env.value('accounts_url');
  }
}
