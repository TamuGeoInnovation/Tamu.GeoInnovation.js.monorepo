import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { PipesModule } from '@tamu-gisc/common/ngx/pipes';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { ReviewComponent } from './review.component';

const routes: Routes = [{ path: '', component: ReviewComponent }];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), PipesModule, UIFormsModule],
  declarations: [ReviewComponent]
})
export class ReviewModule {}
