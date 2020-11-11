import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { WorkshopBuilderComponent } from './workshop-builder.component';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    component: WorkshopBuilderComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), ReactiveFormsModule, UIFormsModule],
  declarations: [WorkshopBuilderComponent]
})
export class WorkshopBuilderModule {}
