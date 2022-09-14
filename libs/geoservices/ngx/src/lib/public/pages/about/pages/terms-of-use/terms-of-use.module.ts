import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { TermsOfUseComponent } from './terms-of-use.component';

const routes: Routes = [
  {
    path: '',
    component: TermsOfUseComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [TermsOfUseComponent]
})
export class TermsOfUseModule {}
