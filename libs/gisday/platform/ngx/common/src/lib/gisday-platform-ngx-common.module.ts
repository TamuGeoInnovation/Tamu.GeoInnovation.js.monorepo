import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import {
  TileNavigationComponent,
  TileComponent,
  TileTitleComponent,
  TileIconComponent,
  TileSubmenuDirective,
  TileSubmenuComponent,
  TileLinkDirective
} from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { HamburgerTriggerComponent } from '@tamu-gisc/ui-kits/ngx/navigation/triggers';

import { FooterComponent } from './modules/footer/footer.component';
import { HeaderComponent } from './modules/header/header.component';
import { GISDayPipesModule } from './pipes/gisday-pipes.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    TileNavigationComponent,
    TileComponent,
    TileTitleComponent,
    TileIconComponent,
    TileSubmenuDirective,
    TileSubmenuComponent,
    TileLinkDirective,
    HamburgerTriggerComponent,
    GISDayPipesModule,
    FooterComponent,
    HeaderComponent
  ],
  providers: [],
  exports: [FooterComponent, HeaderComponent, GISDayPipesModule]
})
export class GisdayPlatformNgxCommonModule {}
