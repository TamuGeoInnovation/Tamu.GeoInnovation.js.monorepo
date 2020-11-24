import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { WorkshopBuilderComponent } from './components/workshop-builder/workshop-builder.component';
import { WorkshopsListComponent } from './components/workshops-list/workshops-list.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, RouterModule, UIFormsModule],
  declarations: [WorkshopBuilderComponent, WorkshopsListComponent],
  exports: [WorkshopBuilderComponent, WorkshopsListComponent]
})
export class WorkshopsCommonModule {}
