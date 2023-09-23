import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CommonNgxAuthModule } from '@tamu-gisc/common/ngx/auth';
import { UITileNavigationModule } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { UINavigationTriggersModule } from '@tamu-gisc/ui-kits/ngx/navigation/triggers';

import { FooterComponent } from './modules/footer/footer.component';
import { HeaderComponent } from './modules/header/header.component';
import { DetailViewComponent } from './modules/detail-view/detail-view.component';
import { OrderByPipe } from './pipes/order-by/order-by-pipe';
import { ParseDateTimeStringsPipe } from './pipes/parse-date-time-strings/parse-date-time-strings.pipe';

@NgModule({
  imports: [CommonModule, RouterModule, UITileNavigationModule, UINavigationTriggersModule, CommonNgxAuthModule],
  declarations: [FooterComponent, HeaderComponent, DetailViewComponent, OrderByPipe, ParseDateTimeStringsPipe],
  providers: [],
  exports: [FooterComponent, HeaderComponent, DetailViewComponent, OrderByPipe, ParseDateTimeStringsPipe]
})
export class GisdayPlatformNgxCommonModule {}
