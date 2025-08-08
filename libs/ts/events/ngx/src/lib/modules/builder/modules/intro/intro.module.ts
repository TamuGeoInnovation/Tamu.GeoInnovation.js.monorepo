import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { IntroComponent } from './intro.component';
import { BuilderModuleBaseModule } from '../builder-module-base/builder-module-base.module';

const routes: Routes = [{ path: '', component: IntroComponent }];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), BuilderModuleBaseModule],
  declarations: [IntroComponent]
})
export class IntroModule {}
