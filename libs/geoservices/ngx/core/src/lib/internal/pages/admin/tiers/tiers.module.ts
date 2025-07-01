import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';

import { TiersComponent } from './tiers.component';
import { TiersListComponent } from './pages/tiers-list/tiers-list.component';

const routes: Routes = [
  {
    path: '',
    component: TiersComponent,
    children: [
      {
        path: '',
        component: TiersListComponent
      },
      {
        path: 'list',
        component: TiersListComponent
      }
      // TODO: Add routes for 'add' and 'edit/:id' when those components are created
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UIFormsModule, PipesModule],
  declarations: [TiersComponent, TiersListComponent],
  exports: [RouterModule]
})
export class TiersModule {}
