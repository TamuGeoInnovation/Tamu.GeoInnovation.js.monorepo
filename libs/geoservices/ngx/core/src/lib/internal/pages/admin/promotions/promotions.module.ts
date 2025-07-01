import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  template: '<div><h1>Promotions</h1><p>Admin promotions functionality will be implemented here.</p></div>'
})
export class PromotionsComponent {}

const routes: Routes = [
  {
    path: '',
    component: PromotionsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [PromotionsComponent],
  exports: [RouterModule]
})
export class PromotionsModule {}
