import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AggiemapCoreUIModule } from '@tamu-gisc/aggiemap';

import { InstructionsComponent } from './components/instructions.component';

const routes: Routes = [
  {
    path: '',
    component: InstructionsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), AggiemapCoreUIModule],
  declarations: [InstructionsComponent]
})
export class InstructionsModule {}
