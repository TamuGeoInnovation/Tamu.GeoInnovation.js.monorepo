import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface QuickLinkItem {
  label: string;
  routerLink: string | string[];
}

@Component({
  selector: 'tamu-gisc-quick-links',
  templateUrl: './quick-links.component.html',
  styleUrls: ['./quick-links.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink]
})
export class QuickLinksComponent {
  @Input()
  public title = 'Quick Links';

  @Input()
  public links: QuickLinkItem[] = [];
}
