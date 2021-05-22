import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { DetailsComponent } from './pages/details/details.component';
import { AdminCountyClaimsComponent } from './admin-county-claims.component';
import { CovidEntityListsModule } from '../../../../modules/lists/lists.module';

const routes: Routes = [
  {
    path: '',
    component: AdminCountyClaimsComponent
  },
  {
    path: 'details/:guid',
    component: DetailsComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    UIFormsModule,
    UILayoutModule,
    CovidEntityListsModule
  ],
  declarations: [AdminCountyClaimsComponent, DetailsComponent]
})
export class AdminCountyClaimsModule {}
