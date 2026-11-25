import { Component, inject, input, model } from '@angular/core';
import { Angulartics2 } from 'angulartics2';
import { Observable } from 'rxjs';

import { trackEvent } from '@tamu-gisc/common/ngx/analytics';

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
      content: this.text()
    };

    trackEvent(this.analytics, 'clipboard_copy', 'ui_interaction', label);
  }
}
