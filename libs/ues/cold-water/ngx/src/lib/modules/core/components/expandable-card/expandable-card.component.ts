import { Component, Input } from '@angular/core';

@Component({
  selector: 'tamu-gisc-expandable-card',
  templateUrl: './expandable-card.component.html',
  styleUrls: ['./expandable-card.component.scss']
})
export class ExpandableCardComponent {
  @Input()
  public collapsed = true;

  public toggle() {
    this.collapsed = !this.collapsed;
  }
}
