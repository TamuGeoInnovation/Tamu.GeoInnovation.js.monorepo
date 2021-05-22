import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ExistingComponent } from './existing.component';
import { ResultLookupPipe } from '../../pipes/result-lookup.pipe';

const routes: Routes = [
  {
    path: '',
    component: ExistingComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [ExistingComponent, ResultLookupPipe]
})
export class ExistingModule {}
