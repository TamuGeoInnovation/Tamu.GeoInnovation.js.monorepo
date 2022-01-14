import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';

import { CountyClaimComponent } from './county-claim/county-claim.component';
import { LockdownDetailsComponent } from './lockdown-details/lockdown-details.component';
import { TestingSiteComponent } from './testing-site/testing-site.component';

@NgModule({
  imports: [CommonModule, RouterModule, UIFormsModule, ReactiveFormsModule, UIFormsModule, PipesModule],
  declarations: [CountyClaimComponent, LockdownDetailsComponent, TestingSiteComponent],
  exports: [CountyClaimComponent, LockdownDetailsComponent, TestingSiteComponent]
})
export class CovidFormsModule {}
