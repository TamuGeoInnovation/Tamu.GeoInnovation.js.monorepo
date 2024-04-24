import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ReviewComponent } from './review.component';

const routes: Routes = [{ path: '', component: ReviewComponent }];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [ReviewComponent]
})
export class ReviewModule {}
