import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { SessionViewComponent } from './session-view.component';

const routes: Routes = [
  {
    path: '',
    component: SessionViewComponent
  }
];

@NgModule({
  declarations: [SessionViewComponent],
  imports: [CommonModule, RouterModule.forChild(routes), UIFormsModule, UILayoutModule],
  exports: [RouterModule]
})
export class SessionViewModule {}
