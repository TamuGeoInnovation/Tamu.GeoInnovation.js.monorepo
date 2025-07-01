import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  template: '<div><h1>Databases</h1><p>Admin databases functionality will be implemented here.</p></div>'
})
export class DatabasesComponent {}

const routes: Routes = [
  {
    path: '',
    component: DatabasesComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [DatabasesComponent],
  exports: [RouterModule]
})
export class DatabasesModule {}
