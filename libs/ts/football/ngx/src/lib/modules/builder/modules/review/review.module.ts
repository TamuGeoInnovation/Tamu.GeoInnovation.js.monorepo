import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ReviewComponent } from './review.component';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';

const routes: Routes = [{ path: '', component: ReviewComponent }];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), PipesModule],
  declarations: [ReviewComponent]
})
export class ReviewModule {}
