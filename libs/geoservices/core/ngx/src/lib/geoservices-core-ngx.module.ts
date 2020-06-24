import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderMobileComponent } from './components/header-mobile/header-mobile.component';
import { HeaderCovidComponent } from './components/header-covid/header-covid.component';

import { FooterLegalComponent } from './components/footer/legal/legal.component';
import { FooterShortcutsComponent } from './components/footer/shortcuts/shortcuts.component';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';
import { TestingSiteListComponent } from './components/listable/submissions/testing-sites/testing-sites.component';
import { CountyListComponent } from './components/listable/submissions/county/county.component';
import { LockdownListComponent } from './components/listable/submissions/lockdown/lockdown.component';

@NgModule({
  imports: [CommonModule, RouterModule, PipesModule],
  declarations: [
    HeaderComponent,
    FooterComponent,
    HeaderMobileComponent,
    HeaderCovidComponent,
    FooterLegalComponent,
    FooterShortcutsComponent,
    TestingSiteListComponent,
    CountyListComponent,
    LockdownListComponent
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    FooterLegalComponent,
    FooterShortcutsComponent,
    HeaderMobileComponent,
    HeaderCovidComponent,
    TestingSiteListComponent,
    CountyListComponent,
    LockdownListComponent
  ]
})
export class GeoservicesCoreNgxModule {}
