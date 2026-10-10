import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { Angulartics2 } from 'angulartics2';
import { Observable } from 'rxjs';

import { v4 as guid } from 'uuid';
import { ClipboardCopyDirective } from '../../directives/copy/copy.directive';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-copy-field',
  templateUrl: './copy.component.html',
  styleUrls: ['./copy.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ClipboardCopyDirective, AsyncPipe]
})
export class CopyComponent {
  private analytics = inject(Angulartics2);

  @Input()
  public text: string;

  @Input()
  public copying: Observable<boolean>;

  public copyCoordsClick() {
    const label = {
      guid: guid(),
      date: Date.now(),
      content: this.text
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
