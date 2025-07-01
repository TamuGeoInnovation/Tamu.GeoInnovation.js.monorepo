import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ShareComponent } from './share.component';

const routes: Routes = [
  {
    path: '',
    component: ShareComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [ShareComponent]
})
export class ShareModule {}
