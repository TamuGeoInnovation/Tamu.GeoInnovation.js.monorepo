import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { PreferencesComponent } from './preferences.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: PreferencesComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [PreferencesComponent],
  exports: [RouterModule]
})
export class PreferencesModule {}
