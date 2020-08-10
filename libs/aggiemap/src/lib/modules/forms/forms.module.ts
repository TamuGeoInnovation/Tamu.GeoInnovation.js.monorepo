import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ReportBadRouteComponent } from './components/report-bad-route/report-bad-route.component';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [ReportBadRouteComponent],
  exports: [ReportBadRouteComponent]
})
export class AggiemapFormsModule {}
