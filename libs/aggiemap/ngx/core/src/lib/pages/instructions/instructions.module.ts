import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';



import { InstructionsComponent } from './components/instructions.component';

const routes: Routes = [
  {
    path: '',
    component: InstructionsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), InstructionsComponent]
})
export class InstructionsModule {}
