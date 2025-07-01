import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  template: '<div><h1>News</h1><p>Admin news functionality will be implemented here.</p></div>'
})
export class NewsComponent {}

const routes: Routes = [
  {
    path: '',
    component: NewsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [NewsComponent],
  exports: [RouterModule]
})
export class NewsModule {}
