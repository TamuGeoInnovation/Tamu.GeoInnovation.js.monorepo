import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { IntroComponent } from './intro.component';


const routes: Routes = [{ path: '', component: IntroComponent }];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), IntroComponent]
})
export class IntroModule {}
