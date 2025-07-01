import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  template: '<div><h1>Surveys</h1><p>Admin surveys functionality will be implemented here.</p></div>'
})
export class SurveysComponent {}

const routes: Routes = [
  {
    path: '',
    component: SurveysComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [SurveysComponent],
  exports: [RouterModule]
})
export class SurveysModule {}
