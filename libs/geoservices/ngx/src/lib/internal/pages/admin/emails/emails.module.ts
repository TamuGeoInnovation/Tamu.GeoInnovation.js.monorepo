import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  template: '<div><h1>Emails</h1><p>Admin emails functionality will be implemented here.</p></div>'
})
export class EmailsComponent {}

const routes: Routes = [
  {
    path: '',
    component: EmailsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [EmailsComponent],
  exports: [RouterModule]
})
export class EmailsModule {}
