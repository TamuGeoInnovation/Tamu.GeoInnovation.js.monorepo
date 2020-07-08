import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AggiemapSidebarModule } from './modules/sidebar/sidebar.module';
import { UIMobileModule } from './modules/mobile-ui/mobile-ui.module';
import { PopupsModule } from './popups/popups.module';
import { ReferenceModule } from './reference/reference.module';
import { TransportationModule } from './transportation/transportation.module';
import { AggiemapCoreUIModule } from './modules/core-ui/core-ui.module';

@NgModule({
  imports: [
    CommonModule,
    PopupsModule,
    ReferenceModule,
    TransportationModule,
    AggiemapSidebarModule,
    AggiemapCoreUIModule,
    UIMobileModule
  ]
})
export class AggiemapModule {}
