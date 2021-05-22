import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TileNavigationComponent } from './components/tile-navigation/tile-navigation.component';
import { TileComponent } from './components/tile/tile.component';
import { TileTitleComponent } from './components/tile-title/tile-title.component';
import { TileIconComponent } from './components/tile-icon/tile-icon.component';

import { TileSubmenuDirective } from './directives/tile-submenu.directive';
import { TileSubmenuComponent } from './components/tile-submenu/tile-submenu.component';
import { TileSubmenuContainerComponent } from './components/tile-submenu-container/tile-submenu-container.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    TileNavigationComponent,
    TileComponent,
    TileTitleComponent,
    TileIconComponent,
    TileSubmenuDirective,
    TileSubmenuComponent,
    TileSubmenuContainerComponent
  ],
  exports: [
    TileNavigationComponent,
    TileComponent,
    TileTitleComponent,
    TileIconComponent,
    TileSubmenuDirective,
    TileSubmenuComponent
  ]
})
export class UITileNavigationModule {}
