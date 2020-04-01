import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderMobileComponent } from './components/header-mobile/header-mobile.component';
import { HeaderCovidComponent } from './components/header-covid/header-covid.component';

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [HeaderComponent, FooterComponent, HeaderMobileComponent, HeaderCovidComponent],
  exports: [HeaderComponent, FooterComponent, HeaderMobileComponent, HeaderCovidComponent]
})
export class GeoservicesCoreNgxModule {}
