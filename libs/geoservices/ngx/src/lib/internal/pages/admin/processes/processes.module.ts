import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  template: '<div><h1>Processes</h1><p>Admin processes functionality will be implemented here.</p></div>'
})
export class ProcessesComponent {}

const routes: Routes = [
  {
    path: '',
    component: ProcessesComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [ProcessesComponent],
  exports: [RouterModule]
})
export class ProcessesModule {}
