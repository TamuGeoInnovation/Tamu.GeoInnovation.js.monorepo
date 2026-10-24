import { Component, inject, input, model } from '@angular/core';
import { Angulartics2 } from 'angulartics2';
import { Observable } from 'rxjs';

import { ClipboardCopyDirective } from '../../directives/copy/copy.directive';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-copy-field',
  templateUrl: './copy.component.html',
  styleUrls: ['./copy.component.scss'],
  imports: [ClipboardCopyDirective, AsyncPipe]
})
export class CopyComponent {
  private analytics = inject(Angulartics2);

  public readonly text = input<string>(undefined);

  // A model rather than an input: the copy directive inside sets it.
  public readonly copying = model<Observable<boolean>>(undefined);

  public copyCoordsClick() {
    const label = {
      guid: crypto.randomUUID(),
      date: Date.now(),
      content: this.text()
    };

    this.analytics.eventTrack.next({
      action: 'clipboard_copy',
      properties: {
        category: 'ui_interaction',
        gstCustom: label
      }
    });
  }
}
