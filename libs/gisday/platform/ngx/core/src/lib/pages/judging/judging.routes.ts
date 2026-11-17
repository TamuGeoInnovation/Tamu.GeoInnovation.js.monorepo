import { Routes } from '@angular/router';

import { JudgingComponent } from './judging.component';

/** A judge's page, from their emailed judging link (#3183). */
export const judgingRoutes: Routes = [
  { path: ':token', component: JudgingComponent },
  { path: '', component: JudgingComponent }
];
