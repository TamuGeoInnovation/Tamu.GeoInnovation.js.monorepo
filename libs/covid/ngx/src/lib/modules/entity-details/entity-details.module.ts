import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CountyClaimInfoDetailsComponent } from './components/county-claim-info-details/county-claim-info-details.component';
import { LockdownInfoDetailsComponent } from './components/lockdown-info-details/lockdown-info-details.component';
import { CovidFormsModule } from '../forms/forms.module';

@NgModule({
  imports: [CommonModule, CovidFormsModule],
  declarations: [CountyClaimInfoDetailsComponent, LockdownInfoDetailsComponent],
  exports: [CountyClaimInfoDetailsComponent, LockdownInfoDetailsComponent]
})
export class CovidEntityDetailsModule {}
