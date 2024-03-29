import { ChangeDetectionStrategy, Component, EventEmitter, Output, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { AbstractValueAccessorFormComponent } from '@tamu-gisc/ui-kits/ngx/forms';

@Component({
  selector: 'tamu-gisc-place-link-form',
  templateUrl: './place-link-form.component.html',
  styleUrls: ['./place-link-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PlaceLinkFormComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaceLinkFormComponent extends AbstractValueAccessorFormComponent<PlaceLinkControlSchema> {
  @Output()
  public remove: EventEmitter<boolean> = new EventEmitter();

  public emitRemove() {
    this.remove.emit(true);
  }
}

export interface PlaceLinkControlSchema {
  guid: string;
  label: string;
  url: string;
}
