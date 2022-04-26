import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { UITileNavigationModule } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { UINavigationTriggersModule } from '@tamu-gisc/ui-kits/ngx/navigation/triggers';

import { FooterComponent } from './modules/footer/footer.component';
import { HeaderComponent } from './modules/header/header.component';
import { DetailViewComponent } from './modules/detail-view/detail-view.component';

@NgModule({
  imports: [CommonModule, RouterModule, UITileNavigationModule, UINavigationTriggersModule],
  declarations: [FooterComponent, HeaderComponent, DetailViewComponent],
  providers: [AuthService],
  exports: [FooterComponent, HeaderComponent, DetailViewComponent]
})
export class GisdayPlatformNgxCommonModule {}
