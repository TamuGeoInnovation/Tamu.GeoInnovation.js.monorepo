import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  template: '<div><h1>Soundex</h1><p>Admin soundex functionality will be implemented here.</p></div>'
})
export class SoundexComponent {}

const routes: Routes = [
  {
    path: '',
    component: SoundexComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [SoundexComponent],
  exports: [RouterModule]
})
export class SoundexModule {}
