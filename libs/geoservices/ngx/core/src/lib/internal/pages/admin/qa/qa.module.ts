import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  template: '<div><h1>QA</h1><p>Admin QA functionality will be implemented here.</p></div>'
})
export class QaComponent {}

const routes: Routes = [
  {
    path: '',
    component: QaComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [QaComponent],
  exports: [RouterModule]
})
export class QaModule {}
