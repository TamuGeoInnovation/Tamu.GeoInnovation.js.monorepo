import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LOCAL_STORAGE, StorageServiceModule } from 'angular-webstorage-service';
import { AppStorage, LocalStoreService } from './services/common-ngx-local-store.service';

@NgModule({
  declarations: [],
  imports: [CommonModule, StorageServiceModule],
  providers: [LocalStoreService, { provide: AppStorage, useExisting: LOCAL_STORAGE }]
})
@NgModule({
  imports: [CommonModule]
})
export class LocalStoreModule {}
