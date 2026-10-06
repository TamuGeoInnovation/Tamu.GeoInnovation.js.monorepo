import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

export interface QuickLinkItem {
  label: string;
  routerLink: string | string[];
}

@Component({
  selector: 'tamu-gisc-quick-links',
  templateUrl: './quick-links.component.html',
  styleUrls: ['./quick-links.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class QuickLinksComponent {
  @Input()
  public title = 'Quick Links';

  @Input()
  public links: QuickLinkItem[] = [];
}
