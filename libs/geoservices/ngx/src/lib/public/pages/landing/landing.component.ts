import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { TabsComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { TabComponent } from '@tamu-gisc/ui-kits/ngx/layout';

@Component({
    selector: 'tamu-gisc-landing',
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLinkActive, RouterLink, TabsComponent, TabComponent]
})
export class LandingComponent implements OnInit {
  public url: string;

  constructor(private readonly env: EnvironmentService) {}

  public ngOnInit(): void {
    this.url = this.env.value('accounts_url');
  }
}
