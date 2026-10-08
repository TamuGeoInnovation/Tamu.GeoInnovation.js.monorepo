import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';

@Component({
    selector: 'tamu-gisc-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLinkActive, RouterLink, RouterOutlet]
})
export class AccountComponent {
  constructor(private titleService: Title) {
    this.titleService.setTitle('Account | TxGIS Day');
  }
}
