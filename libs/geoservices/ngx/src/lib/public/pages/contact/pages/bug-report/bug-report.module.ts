import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { BugReportComponent } from './bug-report.component';


const routes: Routes = [
  {
    path: '',
    component: BugReportComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), BugReportComponent]
})
export class BugReportModule {}
