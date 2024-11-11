import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { GisdayFormsModule } from '@tamu-gisc/gisday/platform/ngx/common';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';

import { AdminSponsorComponent } from './admin-sponsor.component';
import { SponsorListComponent } from './pages/sponsor-list/sponsor-list.component';
import { SponsorEditComponent } from './pages/sponsor-edit/sponsor-edit.component';
import { SponsorAddComponent } from './pages/sponsor-add/sponsor-add.component';

const routes: Routes = [
  {
    path: '',
    component: AdminSponsorComponent,
    children: [
      {
        path: 'edit/:guid',
        component: SponsorEditComponent
      },
      {
        path: 'add',
        component: SponsorAddComponent
      },
      {
        path: '',
        component: SponsorListComponent
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), GisdayFormsModule, UIFormsModule, PipesModule],
  declarations: [AdminSponsorComponent, SponsorListComponent, SponsorEditComponent, SponsorAddComponent],
  exports: [RouterModule]
})
export class AdminSponsorModule {}
