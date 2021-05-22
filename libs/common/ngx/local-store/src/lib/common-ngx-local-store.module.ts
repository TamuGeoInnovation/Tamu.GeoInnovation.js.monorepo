import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LOCAL_STORAGE, StorageServiceModule } from 'ngx-webstorage-service';
import { AppStorage } from './services/common-ngx-local-store.service';

@NgModule({
  declarations: [],
  imports: [CommonModule, StorageServiceModule],
  providers: [{ provide: AppStorage, useExisting: LOCAL_STORAGE }]
})
export class LocalStoreModule {}
