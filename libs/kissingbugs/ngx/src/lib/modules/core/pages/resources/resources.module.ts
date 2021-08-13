import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { ResourcesComponent } from './resources.component';
import { ComponentsModule } from '../../components/components.module';

const routes: Routes = [
  {
    path: '',
    component: ResourcesComponent,
    children: [
      {
        path: '',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UILayoutModule, ComponentsModule],
  declarations: [ResourcesComponent]
})
export class ResourcesModule {}
