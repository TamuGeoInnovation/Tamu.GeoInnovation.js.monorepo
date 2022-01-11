import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { DeleteComponent } from './delete.component';

const routes: Routes = [
  {
    path: '',
    component: DeleteComponent
  }
];
@NgModule({
  declarations: [DeleteComponent],
  imports: [CommonModule, RouterModule.forChild(routes), UIFormsModule]
})
export class DeleteModule {}
