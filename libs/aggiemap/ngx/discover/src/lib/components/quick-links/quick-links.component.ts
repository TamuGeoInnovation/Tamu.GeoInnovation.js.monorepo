import { Component, Input } from '@angular/core';

export interface QuickLinkItem {
  label: string;
  routerLink: string | string[];
}

@Component({
  selector: 'tamu-gisc-quick-links',
  templateUrl: './quick-links.component.html',
  styleUrls: ['./quick-links.component.scss']
})
export class QuickLinksComponent {
  @Input()
  public title = 'Quick Links';

  @Input()
  public links: QuickLinkItem[] = [];
}
