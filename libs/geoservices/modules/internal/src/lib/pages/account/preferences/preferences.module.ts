import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PreferencesComponent } from './preferences.component';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: PreferencesComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, UIFormsModule],
  declarations: [PreferencesComponent],
  exports: [RouterModule]
})
export class PreferencesModule {}
