import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UIDragModule } from '@tamu-gisc/ui-kits/ngx/interactions/draggable';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { PopupComponent } from './containers/base/base.component';
import { PopupMobileComponent } from './containers/mobile/mobile.component';
import { BasePopupComponent } from './components/base/base.component';
import { RevealSidebarOnPopupDirective } from './directives/reveal-sidebar/reveal-sidebar.directive';

@NgModule({
    imports: [CommonModule, UIDragModule, UILayoutModule, PopupComponent, PopupMobileComponent, BasePopupComponent, RevealSidebarOnPopupDirective],
    exports: [PopupComponent, PopupMobileComponent, RevealSidebarOnPopupDirective]
})
export class MapPopupModule {}
