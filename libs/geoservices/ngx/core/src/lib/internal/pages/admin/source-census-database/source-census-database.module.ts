import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  template:
    '<div><h1>Source and Census Database Table</h1><p>Admin source and census database table functionality will be implemented here.</p></div>'
})
export class SourceCensusDatabaseComponent {}

const routes: Routes = [
  {
    path: '',
    component: SourceCensusDatabaseComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [SourceCensusDatabaseComponent],
  exports: [RouterModule]
})
export class SourceCensusDatabaseModule {}
