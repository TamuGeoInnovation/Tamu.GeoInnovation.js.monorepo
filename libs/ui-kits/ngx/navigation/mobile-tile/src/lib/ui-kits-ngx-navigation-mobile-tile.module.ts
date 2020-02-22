import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TileNavigationComponent } from './components/tile-navigation/tile-navigation.component';

@NgModule({
  imports: [CommonModule],
  declarations: [TileNavigationComponent],
  exports: [TileNavigationComponent]
})
export class UITileNavigationModule {}
