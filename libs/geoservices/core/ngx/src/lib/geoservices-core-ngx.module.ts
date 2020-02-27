import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderMobileComponent } from './components/header-mobile/header-mobile.component';

@NgModule({
  imports: [CommonModule],
  declarations: [HeaderComponent, FooterComponent, HeaderMobileComponent],
  exports: [HeaderComponent, FooterComponent, HeaderMobileComponent]
})
export class GeoservicesCoreNgxModule {}
