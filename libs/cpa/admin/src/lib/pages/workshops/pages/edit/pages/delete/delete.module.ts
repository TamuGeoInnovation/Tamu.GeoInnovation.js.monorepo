import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { DeleteComponent } from './delete.component';

const routes: Routes = [
  {
    path: '',
    component: DeleteComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [DeleteComponent]
})
export class DeleteModule {}
