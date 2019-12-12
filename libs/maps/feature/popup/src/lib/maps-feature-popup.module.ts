import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UIDragModule } from '@tamu-gisc/ui-kits/ngx/interactions/draggable';
import { UIStructuralLayoutModule } from '@tamu-gisc/ui-kits/ngx/layout/structural';

import { PopupComponent } from './containers/base/base.component';
import { PopupMobileComponent } from './containers/mobile/mobile.component';

@NgModule({
  imports: [CommonModule, UIDragModule, UIStructuralLayoutModule],
  declarations: [PopupComponent, PopupMobileComponent]
})
export class MapsFeaturePopupModule {}
