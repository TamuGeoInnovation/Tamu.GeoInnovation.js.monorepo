import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { DeleteComponent } from './delete.component';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

const routes: Routes = [
  {
    path: '',
    component: DeleteComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UIFormsModule],
  declarations: [DeleteComponent]
})
export class DeleteModule {}
