import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { LockdownComponent } from './lockdown.component';
import { CovidFormsModule } from '../../../../modules/forms/forms.module';

const routes: Routes = [
  {
    path: '',
    component: LockdownComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UIFormsModule, ReactiveFormsModule, CovidFormsModule],
  declarations: [LockdownComponent]
})
export class LockdownModule {}
