import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { LockdownComponent } from './lockdown.component';

const routes: Routes = [
  {
    path: '',
    component: LockdownComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UIFormsModule, ReactiveFormsModule, FormsModule],
  declarations: [LockdownComponent]
})
export class LockdownModule {}
