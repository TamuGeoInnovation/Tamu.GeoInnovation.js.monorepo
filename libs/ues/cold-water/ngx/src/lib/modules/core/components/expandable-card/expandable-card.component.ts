import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'tamu-gisc-expandable-card',
  templateUrl: './expandable-card.component.html',
  styleUrls: ['./expandable-card.component.scss']
})
export class ExpandableCardComponent implements OnInit {
  @Input()
  public collapsed = true;

  constructor() {}

  public ngOnInit(): void {}

  public toggle() {
    this.collapsed = !this.collapsed;
  }
}
