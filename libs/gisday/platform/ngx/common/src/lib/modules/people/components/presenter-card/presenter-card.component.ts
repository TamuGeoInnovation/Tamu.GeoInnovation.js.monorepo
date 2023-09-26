import { Component, Input, OnInit } from '@angular/core';

import { Speaker } from '@tamu-gisc/gisday/platform/data-api';

@Component({
  selector: 'tamu-gisc-presenter-card',
  templateUrl: './presenter-card.component.html',
  styleUrls: ['./presenter-card.component.scss']
})
export class PresenterCardComponent implements OnInit {
  @Input()
  public speaker: Partial<Speaker>;

  public speakerInitials: string;

  public ngOnInit(): void {
    this.speakerInitials = this.speaker?.firstName[0] + this.speaker?.lastName[0];
  }
}

