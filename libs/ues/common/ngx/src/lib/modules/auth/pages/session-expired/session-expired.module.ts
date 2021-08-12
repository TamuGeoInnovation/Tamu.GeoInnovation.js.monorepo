import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { SessionExpiredComponent } from './session-expired.component';
import { UESCoreUIModule } from '../../../core-ui/core-ui.module';

const routes: Routes = [
  {
    path: 'session/expired',
    component: SessionExpiredComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UESCoreUIModule],
  declarations: [SessionExpiredComponent]
})
export class SessionExpiredModule {}
