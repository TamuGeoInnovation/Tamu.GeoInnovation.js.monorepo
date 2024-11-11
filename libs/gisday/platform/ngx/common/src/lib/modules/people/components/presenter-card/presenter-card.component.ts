import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Speaker } from '@tamu-gisc/gisday/platform/data-api';

@Component({
  selector: 'tamu-gisc-presenter-card',
  templateUrl: './presenter-card.component.html',
  styleUrls: ['./presenter-card.component.scss']
})
export class PresenterCardComponent implements OnInit {
  @Input()
  public speaker: Partial<Speaker>;

  @Input()
  public linkable = true;

  @Input()
  public showActions = false;

  @Output()
  public delete: EventEmitter<void> = new EventEmitter();

  public speakerInitials: string;

  public ngOnInit(): void {
    this.speakerInitials = this.speaker?.firstName[0] + this.speaker?.lastName[0];
  }

  public emitAction(action: string): void {
    if (action === 'delete') {
      this.delete.emit();
    }
  }
}
