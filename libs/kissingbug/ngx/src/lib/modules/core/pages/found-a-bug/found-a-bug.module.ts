import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { FoundABugComponent } from './found-a-bug.component';
import { ComponentsModule } from '../../components/components.module';

const routes: Routes = [
  {
    path: '',
    component: FoundABugComponent,
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
  declarations: [FoundABugComponent]
})
export class FoundABugModule {}
