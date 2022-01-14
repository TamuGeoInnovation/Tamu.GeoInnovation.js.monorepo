import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { SingleTypeComponent } from './single-type.component';
import { ComponentsModule } from '../../components/components.module';

const routes: Routes = [
  {
    path: '',
    component: SingleTypeComponent,
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
  declarations: [SingleTypeComponent]
})
export class SingleTypeModule {}
