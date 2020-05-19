import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TWOHeaderComponent } from './header.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [TWOHeaderComponent],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [TWOHeaderComponent]
})
export class TWOHeaderModule { }
