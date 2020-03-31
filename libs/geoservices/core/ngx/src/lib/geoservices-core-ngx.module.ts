import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderMobileComponent } from './components/header-mobile/header-mobile.component';
import { HeaderCovidComponent } from './components/header-covid/header-covid.component';
import { TestingSitesAdvancedComponent } from './components/forms/testing-sites-advanced/testing-sites-advanced.component';

@NgModule({
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, UIFormsModule],
  declarations: [
    HeaderComponent,
    FooterComponent,
    HeaderMobileComponent,
    HeaderCovidComponent,
    TestingSitesAdvancedComponent
  ],
  exports: [HeaderComponent, FooterComponent, HeaderMobileComponent, HeaderCovidComponent, TestingSitesAdvancedComponent]
})
export class GeoservicesCoreNgxModule {}
