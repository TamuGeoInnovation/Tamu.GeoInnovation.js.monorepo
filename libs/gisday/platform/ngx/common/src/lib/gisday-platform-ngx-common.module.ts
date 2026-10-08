import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { UITileNavigationModule } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { UINavigationTriggersModule } from '@tamu-gisc/ui-kits/ngx/navigation/triggers';

import { FooterComponent } from './modules/footer/footer.component';
import { HeaderComponent } from './modules/header/header.component';
import { GISDayPipesModule } from './pipes/gisday-pipes.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    UITileNavigationModule,
    UINavigationTriggersModule,
    GISDayPipesModule,
    FooterComponent,
    HeaderComponent
  ],
  providers: [],
  exports: [FooterComponent, HeaderComponent, GISDayPipesModule]
})
export class GisdayPlatformNgxCommonModule {}
