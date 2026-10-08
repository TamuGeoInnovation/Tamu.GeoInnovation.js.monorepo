import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { FaqComponent } from './faq.component';

const routes: Routes = [
  {
    path: '',
    component: FaqComponent
  }
];

@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes), FaqComponent],
    exports: [RouterModule]
})
export class FaqModule {}
