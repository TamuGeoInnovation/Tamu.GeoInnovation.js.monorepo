import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';
import { TierAddEditFormModule } from '@tamu-gisc/geoservices/ngx/common';

import { TiersComponent } from './tiers.component';
import { TiersListComponent } from './pages/tiers-list/tiers-list.component';
import { TierAddComponent } from './pages/tier-add/tier-add.component';
import { TierEditComponent } from './pages/tier-edit/tier-edit.component';

const routes: Routes = [
  {
    path: '',
    component: TiersComponent,
    children: [
      {
        path: 'list',
        component: TiersListComponent
      },
      {
        path: 'add',
        component: TierAddComponent
      },
      {
        path: 'edit/:id',
        component: TierEditComponent
      },
      {
        path: '',
        component: TiersListComponent
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UIFormsModule, PipesModule, TierAddEditFormModule],
  declarations: [TiersComponent, TiersListComponent, TierAddComponent, TierEditComponent],
  exports: [RouterModule]
})
export class TiersModule {}
