import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { AdminLockdownsComponent } from './admin-lockdowns.component';
import { DetailsComponent } from './pages/details/details.component';
import { CovidEntityListsModule } from '../../../../modules/lists/lists.module';

const routes: Routes = [
  {
    path: '',
    component: AdminLockdownsComponent
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
    UILayoutModule,
    UIFormsModule,
    CovidEntityListsModule
  ],
  declarations: [AdminLockdownsComponent, DetailsComponent]
})
export class AdminLockdownsModule {}
