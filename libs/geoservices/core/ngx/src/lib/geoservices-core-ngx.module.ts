import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AbstractInteractiveServiceComponent } from './abstracts/abstract-interactive-service/abstract-interactive-service.component';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderMobileComponent } from './components/header-mobile/header-mobile.component';
import { InteractiveGeocoderComponent } from './components/interactive-geocoder/interactive-geocoder.component';

@NgModule({
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, UIFormsModule],
  declarations: [
    HeaderComponent,
    FooterComponent,
    HeaderMobileComponent,
    AbstractInteractiveServiceComponent,
    InteractiveGeocoderComponent
  ],
  exports: [HeaderComponent, FooterComponent, HeaderMobileComponent, InteractiveGeocoderComponent]
})
export class GeoservicesCoreNgxModule {}
