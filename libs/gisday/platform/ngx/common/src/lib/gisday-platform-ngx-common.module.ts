import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { UITileNavigationModule } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { UINavigationTriggersModule } from '@tamu-gisc/ui-kits/ngx/navigation/triggers';

import { FooterComponent } from './modules/footer/footer.component';
import { HeaderComponent } from './modules/header/header.component';
import { DetailViewComponent } from './modules/detail-view/detail-view.component';
import { OrderByPipe } from './utils/order-by-pipe';
import { CommonNgxAuthModule } from '@tamu-gisc/common/ngx/auth';

@NgModule({
  imports: [CommonModule, RouterModule, UITileNavigationModule, UINavigationTriggersModule, CommonNgxAuthModule],
  declarations: [FooterComponent, HeaderComponent, DetailViewComponent],
  providers: [],
  exports: [FooterComponent, HeaderComponent, DetailViewComponent]
})
export class GisdayPlatformNgxCommonModule {}

@NgModule({
  declarations: [OrderByPipe],
  exports: [OrderByPipe]
})
export class GisdayPlatformNgxPipesModule {}
