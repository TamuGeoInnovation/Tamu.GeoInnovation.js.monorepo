import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface QuickLinkItem {
  label: string;
  routerLink: string | string[];
}

@Component({
  selector: 'tamu-gisc-quick-links',
  templateUrl: './quick-links.component.html',
  styleUrls: ['./quick-links.component.scss'],
  imports: [RouterLink]
})
export class QuickLinksComponent {
  public readonly title = input('Quick Links');

  public readonly links = input<QuickLinkItem[]>([]);
}
