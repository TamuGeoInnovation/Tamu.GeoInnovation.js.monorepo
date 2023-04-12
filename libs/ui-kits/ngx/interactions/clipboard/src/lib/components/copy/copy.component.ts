import { Component, Input } from '@angular/core';
import { Angulartics2 } from 'angulartics2';
import { Observable } from 'rxjs';

import { v4 as guid } from 'uuid';

@Component({
  selector: 'tamu-gisc-copy-field',
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
      action: 'copy_clipboard',
      properties: {
        category: 'ui_interaction',
        gstCustom: label
      }
    });
  }
}
