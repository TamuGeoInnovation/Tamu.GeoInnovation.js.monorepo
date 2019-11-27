import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { DataViewerComponent } from './data-viewer.component';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [{ path: '', component: DataViewerComponent }];

@NgModule({
  declarations: [DataViewerComponent],
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, UIFormsModule]
})
export class DataViewerModule {}
