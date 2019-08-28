import { Component, Input } from '@angular/core';
import { Angulartics2 } from 'angulartics2';
import { Observable } from 'rxjs';

import * as guid from 'uuid/v4';

@Component({
  selector: 'copy',
  templateUrl: './copy.component.html',
  styleUrls: ['./copy.component.scss']
})
export class CopyComponent {
  @Input()
  public text: string;

  @Input()
  public copying: Observable<boolean>;

  constructor(private analytics: Angulartics2) {}

  public copyCoordsClick() {
    const label = {
      guid: guid(),
      date: Date.now(),
      value: this.text
    };

    this.analytics.eventTrack.next({
      action: 'Copy Coordinates',
      properties: {
        category: 'UI Interaction',
        label: JSON.stringify(label)
      }
    });
  }
}
