import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TestingModule } from '@tamu-gisc/dev-tools/application-testing';

import { TamuBlockBrandingComponent } from './components/tamu-block/tamu-block.component';
import { ReveilleConsoleLogComponent } from './components/reveille-console-log/reveille-console-log.component';
import { PageLoaderComponent } from './components/page-loader/page-loader.component';
import { LockupComponent } from './components/lockup/lockup.component';

@NgModule({
  imports: [CommonModule, TestingModule],
  declarations: [TamuBlockBrandingComponent, ReveilleConsoleLogComponent, PageLoaderComponent, LockupComponent],
  exports: [TamuBlockBrandingComponent, ReveilleConsoleLogComponent, PageLoaderComponent, LockupComponent]
})
export class UITamuBrandingModule {}
