import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClickCoordinatesComponent } from './components/click-coordinates/click-coordinates.component';

import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

@NgModule({
  imports: [CommonModule, UIClipboardModule],
  declarations: [ClickCoordinatesComponent],
  exports: [ClickCoordinatesComponent]
})
export class MapsFeatureCoordinatesModule {}
