import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PipesModule } from '@tamu-gisc/common/ngx/pipes';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { UITileNavigationModule } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { UINavigationTriggersModule } from '@tamu-gisc/ui-kits/ngx/navigation/triggers';

import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderMobileComponent } from './components/header-mobile/header-mobile.component';

import { FooterLegalComponent } from './components/footer/legal/legal.component';
import { FooterShortcutsComponent } from './components/footer/shortcuts/shortcuts.component';
import { ReleaseInfoComponent } from './components/footer/release-info/release-info.component';
import { RevivalModalComponent } from './components/modals/revival-modal/revival-modal.component';
import { RevivalBannerComponent } from './components/revival-banner/revival-banner.component';

@NgModule({
  imports: [CommonModule, RouterModule, PipesModule, UILayoutModule, UITileNavigationModule, UINavigationTriggersModule],
  declarations: [
    HeaderComponent,
    FooterComponent,
    HeaderMobileComponent,
    FooterLegalComponent,
    FooterShortcutsComponent,
    ReleaseInfoComponent,
    RevivalModalComponent,
    RevivalBannerComponent
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    FooterLegalComponent,
    FooterShortcutsComponent,
    HeaderMobileComponent,
    RevivalBannerComponent
  ]
})
export class GeoservicesCoreNgxModule {}
