import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { HighlightPlusModule } from 'ngx-highlightjs/plus';

import { ImplementationsComponent } from './implementations.component';

const routes: Routes = [
  {
    path: '',
    component: ImplementationsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), HighlightPlusModule],
  declarations: [ImplementationsComponent],
  exports: [RouterModule]
})
export class ImplementationsModule {}
