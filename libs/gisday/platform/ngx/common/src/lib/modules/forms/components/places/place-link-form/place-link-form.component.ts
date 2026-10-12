import { ChangeDetectionStrategy, Component, forwardRef, output } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

import { AbstractValueAccessorFormComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TextboxComponent, FormsModule]
})
export class PlaceLinkFormComponent extends AbstractValueAccessorFormComponent<PlaceLinkControlSchema> {
  public readonly remove = output<boolean>();

  public emitRemove() {
    this.remove.emit(true);
  }
}

export interface PlaceLinkControlSchema {
  guid: string;
  label: string;
  url: string;
}
