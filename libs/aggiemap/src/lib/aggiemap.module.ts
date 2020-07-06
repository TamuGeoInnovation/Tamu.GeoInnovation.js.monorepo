import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PopupsModule } from './popups/popups.module';
import { ReferenceModule } from './reference/reference.module';
import { TransportationModule } from './transportation/transportation.module';
import { AggiemapSidebarModule } from './modules/sidebar/sidebar.module';

@NgModule({
  imports: [CommonModule, PopupsModule, ReferenceModule, TransportationModule, AggiemapSidebarModule]
})
export class AggiemapModule {}
