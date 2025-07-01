import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  template: '<div><h1>Tiers</h1><p>Admin tiers functionality will be implemented here.</p></div>'
})
export class TiersComponent {}

const routes: Routes = [
  {
    path: '',
    component: TiersComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [TiersComponent],
  exports: [RouterModule]
})
export class TiersModule {}
