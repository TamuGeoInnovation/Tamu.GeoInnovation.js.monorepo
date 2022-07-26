import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PipesModule } from '@tamu-gisc/common/ngx/pipes';

import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderMobileComponent } from './components/header-mobile/header-mobile.component';

import { FooterLegalComponent } from './components/footer/legal/legal.component';
import { FooterShortcutsComponent } from './components/footer/shortcuts/shortcuts.component';

@NgModule({
  imports: [CommonModule, RouterModule, PipesModule],
  declarations: [HeaderComponent, FooterComponent, HeaderMobileComponent, FooterLegalComponent, FooterShortcutsComponent],
  exports: [HeaderComponent, FooterComponent, FooterLegalComponent, FooterShortcutsComponent, HeaderMobileComponent]
})
export class GeoservicesCoreNgxModule {}
