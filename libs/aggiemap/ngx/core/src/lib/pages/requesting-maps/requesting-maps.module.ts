import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';



import { RequestingMapsComponent } from './components/requesting-maps.component';

const routes: Routes = [
  {
    path: '',
    component: RequestingMapsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), RequestingMapsComponent]
})
export class RequestingMapsModule {}
