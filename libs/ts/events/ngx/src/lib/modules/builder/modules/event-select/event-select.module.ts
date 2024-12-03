import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { EventSelectComponent } from './event-select.component';

const routes: Routes = [{ path: '', component: EventSelectComponent }];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [EventSelectComponent]
})
export class EventSelectModule {}
