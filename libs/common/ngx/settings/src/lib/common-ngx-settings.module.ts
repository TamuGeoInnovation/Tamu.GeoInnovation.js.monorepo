import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LocalStoreModule } from '@tamu-gisc/common/ngx/local-store';
import { SettingsService } from './services/common-ngx-settings.service';

@NgModule({
  declarations: [],
  imports: [CommonModule, LocalStoreModule],
  providers: [SettingsService]
})
export class SettingsModule {}
