import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { LockdownInfosListComponent } from './components/lockdown-infos-list/lockdown-infos-list.component';
import { CountyClaimInfosListComponent } from './components/county-claim-infos-list/county-claim-infos-list.component';
import { CovidEntityDetailsModule } from '../entity-details/entity-details.module';

@NgModule({
  imports: [CommonModule, UILayoutModule, CovidEntityDetailsModule],
  declarations: [LockdownInfosListComponent, CountyClaimInfosListComponent],
  exports: [LockdownInfosListComponent, CountyClaimInfosListComponent]
})
export class CovidEntityListsModule {}
