import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { MyClassesComponent } from './my-classes.component';

const routes: Routes = [
  {
    path: '',
    component: MyClassesComponent
  }
];

@NgModule({
  declarations: [MyClassesComponent],
  imports: [CommonModule, RouterModule.forChild(routes), UIFormsModule, UILayoutModule],
  exports: [RouterModule]
})
export class MyClassesModule {}
