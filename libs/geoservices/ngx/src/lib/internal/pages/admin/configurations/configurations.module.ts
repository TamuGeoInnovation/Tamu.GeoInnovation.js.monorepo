import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  template: '<div><h1>Configurations</h1><p>Admin configurations functionality will be implemented here.</p></div>'
})
export class ConfigurationsComponent {}

const routes: Routes = [
  {
    path: '',
    component: ConfigurationsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [ConfigurationsComponent],
  exports: [RouterModule]
})
export class ConfigurationsModule {}
